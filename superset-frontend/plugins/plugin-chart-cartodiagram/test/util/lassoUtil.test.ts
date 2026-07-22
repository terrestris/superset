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

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { getFeaturesInLasso } from '../../src/util/lassoUtil';

const makeLayer = (features: Feature[]) =>
  new VectorLayer({ source: new VectorSource({ features }) });

const makePointFeature = (x: number, y: number, props: Record<string, unknown> = {}) => {
  const f = new Feature(new Point([x, y]));
  f.setProperties(props);
  return f;
};

/** A simple square lasso polygon covering [0, 0] to [10, 10]. */
const squareLasso = new Polygon([
  [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0],
  ],
]);

test('returns features whose geometry is inside the lasso polygon', () => {
  const inside = makePointFeature(5, 5, { region: 'A' });
  const outside = makePointFeature(20, 20, { region: 'B' });
  const layer = makeLayer([inside, outside]);

  const result = getFeaturesInLasso([layer], squareLasso);

  expect(result).toHaveLength(1);
  expect(result[0]).toBe(inside);
});

test('returns an empty array when no features are inside the lasso', () => {
  const outside = makePointFeature(20, 20, { region: 'A' });
  const layer = makeLayer([outside]);

  const result = getFeaturesInLasso([layer], squareLasso);

  expect(result).toHaveLength(0);
});

test('returns an empty array when data layers are empty', () => {
  const result = getFeaturesInLasso([], squareLasso);

  expect(result).toHaveLength(0);
});

test('collects features from multiple data layers', () => {
  const featureA = makePointFeature(2, 2, { region: 'A' });
  const featureB = makePointFeature(8, 8, { region: 'B' });
  const layerA = makeLayer([featureA]);
  const layerB = makeLayer([featureB]);

  const result = getFeaturesInLasso([layerA, layerB], squareLasso);

  expect(result).toHaveLength(2);
});

test('ignores features whose geometry is null', () => {
  const noGeom = new Feature();
  noGeom.setProperties({ region: 'A' });
  const layer = makeLayer([noGeom]);

  const result = getFeaturesInLasso([layer], squareLasso);

  expect(result).toHaveLength(0);
});
