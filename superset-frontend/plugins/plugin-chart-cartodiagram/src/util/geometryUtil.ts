/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Util for geometry related operations.
 */

import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import {
  MultiPolygon as OlMultiPolygon,
  Point as OlPoint,
  Polygon as OlPolygon,
} from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import { Point as GeoJsonPoint } from 'geojson';
import { FitOptions } from 'ol/View';
import { Extent } from 'ol/extent';

// Precision used to normalize coordinates before comparing polygon edges.
// Higher values make edge matching stricter and therefore reduce merging.
// Lower values make edge matching more permissive and can merge nearly
// coincident borders. In the future this could become a configurable UI
// setting if users need to tune the merge behavior for their datasets.
const EDGE_COMPARISON_PRECISION = 6;

/**
 * Extracts the coordinate from a Point GeoJSON in the current map projection.
 *
 * @param geoJsonPoint The GeoJSON string for the point
 *
 * @returns The coordinate
 */
export const getProjectedCoordinateFromPointGeoJson = (
  geoJsonPoint: GeoJsonPoint,
) => {
  const geom: OlPoint = new GeoJSON().readGeometry(geoJsonPoint, {
    // TODO: adapt to map projection
    featureProjection: 'EPSG:3857',
  }) as OlPoint;
  return geom.getCoordinates();
};

/**
 * Computes the extent for an array of features.
 *
 * @param features An Array of OpenLayers features
 * @returns The OpenLayers extent or undefined
 */
export const getExtentFromFeatures = (features: Feature[]) => {
  if (features.length === 0) {
    return undefined;
  }
  const source = new VectorSource();
  source.addFeatures(features);
  return source.getExtent();
};

/**
 * Generates a padding array for the map extent.
 * @param mapExtentPadding The selected map extent padding value
 * @returns An array with the padding values or undefined
 */
export const getMapExtentPadding = (
  mapExtentPadding?: number,
): FitOptions['padding'] | undefined =>
  mapExtentPadding !== undefined ? Array(4).fill(mapExtentPadding) : undefined;

const cloneRing = (ring: number[][]) =>
  ring.map(coord => [...coord]) as number[][];

const closeRing = (ring: number[][]) => {
  if (ring.length === 0) {
    return ring;
  }
  const [firstX, firstY] = ring[0];
  const [lastX, lastY] = ring[ring.length - 1];
  if (firstX === lastX && firstY === lastY) {
    return ring;
  }
  return [...ring, [...ring[0]]];
};

// Coordinates are rounded before edge comparison so tiny floating-point
// differences do not prevent exact shared-border detection. This is not a
// spatial tolerance or buffer: edges are still only merged when their
// normalized coordinates match after rounding.
const getCoordinateKey = (coord: number[]) =>
  coord
    .map(value => Number(value.toFixed(EDGE_COMPARISON_PRECISION)))
    .join(',');

const getRingSignedArea = (ring: number[][]) =>
  ring.slice(0, -1).reduce((area, coord, idx) => {
    const next = ring[idx + 1];
    return area + coord[0] * next[1] - next[0] * coord[1];
  }, 0);

const getPolygonOuterRings = (features: Feature[]) =>
  features.flatMap(feature => {
    const geometry = feature.getGeometry();
    if (geometry instanceof OlPolygon) {
      return [closeRing(cloneRing(geometry.getCoordinates()[0]))];
    }
    if (geometry instanceof OlMultiPolygon) {
      return geometry
        .getCoordinates()
        .map(polygonCoords => closeRing(cloneRing(polygonCoords[0])));
    }
    return [];
  });

/**
 * Check whether all provided features use polygonal geometries.
 *
 * Supports both Polygon and MultiPolygon OpenLayers geometries.
 *
 * @param features The features to inspect
 * @returns True if all features are polygonal, false otherwise
 */
export const areFeaturesPolygonal = (features: Feature[]) =>
  features.length > 0 &&
  features.every(feature => {
    const geometry = feature.getGeometry();
    return geometry instanceof OlPolygon || geometry instanceof OlMultiPolygon;
  });

/**
 * Merge polygon features by removing shared internal edges.
 *
 * This is intended for display-oriented aggregation of adjacent polygons, for
 * example when only the outer perimeter of a filtered administrative area
 * should remain visible.
 * 
 * We could use a geometry processing library like JSTS or turf for this, 
 * but this custom avoid heavy union operations and avoid to add a dependency to the project.
 * 
 * @param features The polygon features to merge
 * @returns The merged polygon features, or the original features if merging is
 * not applicable
 */
export const mergePolygonFeatures = (features: Feature[]) => {
  if (!areFeaturesPolygonal(features)) {
    return features;
  }

  // Count normalized polygon edges so shared borders can be removed and only
  // the outer perimeter remains visible in the merged presentation.
  const edgeCounts = new Map<
    string,
    {
      count: number;
      start: number[];
      end: number[];
      startKey: string;
      endKey: string;
    }
  >();

  getPolygonOuterRings(features).forEach(ring => {
    for (let i = 0; i < ring.length - 1; i += 1) {
      const start = ring[i];
      const end = ring[i + 1];
      const startKey = getCoordinateKey(start);
      const endKey = getCoordinateKey(end);
      const edgeKey =
        startKey < endKey ? `${startKey}|${endKey}` : `${endKey}|${startKey}`;
      const previous = edgeCounts.get(edgeKey);
      edgeCounts.set(edgeKey, {
        count: (previous?.count || 0) + 1,
        start,
        end,
        startKey,
        endKey,
      });
    }
  });

  const boundaryEdges = Array.from(edgeCounts.values())
    .filter(edge => edge.count % 2 === 1)
    .map((edge, idx) => ({ ...edge, id: `edge-${idx}` }));

  // Build an adjacency graph from the remaining outer edges in order to stitch
  // them back into closed rings.
  const adjacency = new Map<string, typeof boundaryEdges>();
  boundaryEdges.forEach(edge => {
    adjacency.set(edge.startKey, [
      ...(adjacency.get(edge.startKey) || []),
      edge,
    ]);
    adjacency.set(edge.endKey, [...(adjacency.get(edge.endKey) || []), edge]);
  });

  const usedEdges = new Set<string>();
  const mergedFeatures: Feature[] = [];

  boundaryEdges.forEach(edge => {
    if (usedEdges.has(edge.id)) {
      return;
    }

    const ring = [edge.start, edge.end].map(coord => [...coord]);
    let currentKey = edge.endKey;
    let previousKey = edge.startKey;
    usedEdges.add(edge.id);

    // Walk from edge to edge until the boundary closes back on the starting
    // coordinate, producing one merged outer ring.
    while (currentKey !== edge.startKey) {
      const candidates = adjacency.get(currentKey) || [];
      let nextEdge;
      for (let i = 0; i < candidates.length; i += 1) {
        const candidate = candidates[i];
        if (
          !usedEdges.has(candidate.id) &&
          (candidate.startKey !== previousKey ||
            candidate.endKey !== currentKey) &&
          (candidate.endKey !== previousKey ||
            candidate.startKey !== currentKey)
        ) {
          nextEdge = candidate;
          break;
        }
      }

      if (!nextEdge) {
        break;
      }

      usedEdges.add(nextEdge.id);

      const nextKey =
        nextEdge.startKey === currentKey ? nextEdge.endKey : nextEdge.startKey;
      const nextCoord =
        nextEdge.startKey === currentKey ? nextEdge.end : nextEdge.start;

      ring.push([...nextCoord]);
      previousKey = currentKey;
      currentKey = nextKey;
    }

    const closedRing = closeRing(ring);
    if (closedRing.length >= 4) {
      mergedFeatures.push(new Feature(new OlPolygon([closedRing])));
    }
  });

  return mergedFeatures.length > 0 ? mergedFeatures : features;
};

/**
 * Create a polygon mask feature that covers the whole extent except the focused
 * polygon area.
 *
 * The resulting feature uses the provided extent as the outer ring and the
 * focused polygon perimeters as holes.
 *
 * @param focusFeatures The polygon features defining the visible focus area
 * @param extent The outer extent covered by the mask
 * @returns The mask feature or undefined if the input features are not
 * polygonal
 */
export const createMaskFeature = (focusFeatures: Feature[], extent: Extent) => {
  if (!areFeaturesPolygonal(focusFeatures)) {
    return undefined;
  }

  // The mask is a full-extent polygon with the focused polygons inserted as
  // holes, so only the outside area gets faded by the overlay style.
  const [minX, minY, maxX, maxY] = extent;
  const outerRing = [
    [minX, minY],
    [minX, maxY],
    [maxX, maxY],
    [maxX, minY],
    [minX, minY],
  ];
  const outerArea = getRingSignedArea(outerRing);

  const holes = getPolygonOuterRings(focusFeatures).map(ring => {
    const holeArea = getRingSignedArea(ring);
    if (Math.sign(outerArea) === Math.sign(holeArea)) {
      return [...ring].reverse();
    }
    return ring;
  });

  return new Feature(new OlPolygon([outerRing, ...holes]));
};
