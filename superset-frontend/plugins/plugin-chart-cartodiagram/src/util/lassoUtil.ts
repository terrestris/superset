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
 * Utility functions for the freehand lasso selection tool.
 */

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import LinearRing from 'ol/geom/LinearRing';
import MultiPoint from 'ol/geom/MultiPoint';
import MultiLineString from 'ol/geom/MultiLineString';
import MultiPolygon from 'ol/geom/MultiPolygon';
import GeometryCollection from 'ol/geom/GeometryCollection';
import Polygon from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import type { FlatStyleLike } from 'ol/style/flat';
import OL3Parser from 'jsts/org/locationtech/jts/io/OL3Parser';
import RelateOp from 'jsts/org/locationtech/jts/operation/relate/RelateOp';
import { GeometryFactory, PrecisionModel } from 'jsts/org/locationtech/jts/geom';
import { intersects } from 'ol/extent';

const precisionModel = new PrecisionModel();
const geometryFactory = new GeometryFactory(precisionModel, 3857);
const parser = new OL3Parser(geometryFactory, undefined);
parser.inject(
  Point,
  LineString,
  LinearRing,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
  GeometryCollection,
);

/**
 * Flat style applied to the freehand lasso sketch while the user is drawing.
 */
/* eslint-disable theme-colors/no-literal-colors */
export const LASSO_DRAW_STYLE: FlatStyleLike = [
  {
    // Subtle area fill — lets the underlying data show through
    'fill-color': 'rgba(22, 119, 255, 0.08)',
    // White halo behind the dashed stroke for contrast on any basemap
    'stroke-color': 'rgba(255, 255, 255, 0.65)',
    'stroke-width': 4,
    'stroke-line-cap': 'round',
    'stroke-line-join': 'round',
  },
  {
    // Primary dashed stroke — communicates "selection in progress"
    'stroke-color': 'rgba(22, 119, 255, 0.9)',
    'stroke-width': 2,
    'stroke-line-dash': [8, 5],
    'stroke-line-cap': 'round',
    'stroke-line-join': 'round',
  },
  {
    // Anchor point and current-cursor indicator
    'circle-radius': 5,
    'circle-fill-color': '#1677ff',
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 2,
  },
];
/* eslint-enable theme-colors/no-literal-colors */

/**
 * Returns features from the given data layers whose geometry intersects the
 * provided lasso polygon.
 *
 * @param dataLayers The vector layers to search for features
 * @param lassoPolygon The freehand polygon drawn by the user
 */
export const getFeaturesInLasso = (
  dataLayers: VectorLayer<VectorSource>[],
  lassoPolygon: Polygon,
): Feature[] => {
  const lassoExtent = lassoPolygon.getExtent();
  const jstsLasso = parser.read(lassoPolygon);
  const featuresInLasso = dataLayers.flatMap(layer =>
    layer
      .getSource()!
      .getFeatures()
      .filter(feature => {
        const geom = feature.getGeometry();
        if (!geom) return false;
        return intersects(lassoExtent, geom.getExtent());
      })
      .filter(feature => {
        const jstsGeom = parser.read(feature.getGeometry());
        return RelateOp.relate(jstsGeom, jstsLasso).isIntersects();
      }),
  );

  return featuresInLasso;
};
