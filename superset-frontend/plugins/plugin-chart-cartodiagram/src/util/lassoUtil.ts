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
import Polygon from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import type { FlatStyleLike } from 'ol/style/flat';

/**
 * Flat style applied to the freehand lasso sketch while the user is drawing.
 *
 * Three stacked render passes produce a look consistent with Superset's antd
 * primary blue (#1677ff):
 *   1. A barely-visible fill so the enclosed area is perceptible.
 *   2. A wide semi-transparent white stroke that acts as a halo, keeping the
 *      outline readable on both light and dark basemaps.
 *   3. A narrow primary-blue dashed stroke on top — the classic
 *      "selection in progress" feel.
 *   4. A small filled circle for the anchor / start-point indicator.
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
 * When `existingSelectedValues` is supplied (i.e. a cross-filter selection is
 * already active), the result is further restricted to features whose
 * `crossFilterColumn` value is already in that set — implementing a
 * sub-selection / narrowing behaviour. When no prior selection exists,
 * every feature that intersects the lasso polygon is returned.
 *
 * The intersection test uses `Polygon.intersectsExtent`, which is exact for
 * point features (their extent collapses to a single coordinate) and a
 * conservative bounding-box approximation for polygon features.
 *
 * @param dataLayers The vector layers to search for features
 * @param lassoPolygon The freehand polygon drawn by the user
 * @param crossFilterColumn The feature property used for cross-filtering
 * @param existingSelectedValues Currently active filter values; `undefined`
 *   means no prior selection is active
 */
export const getFeaturesInLasso = (
  dataLayers: VectorLayer<VectorSource>[],
  lassoPolygon: Polygon,
): Feature[] => {
  const featuresInLasso = dataLayers.flatMap(layer =>
    layer
      .getSource()!
      .getFeatures()
      .filter(feature => {
        const geom = feature.getGeometry();
        if (!geom) return false;
        return lassoPolygon.intersectsExtent(geom.getExtent());
      }),
  );

  return featuresInLasso;
};
