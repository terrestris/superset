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

import { ZoomConfigs } from '../../src/types';
import {
  computeConfigValues,
  MAX_ZOOM_LEVEL,
  MIN_ZOOM_LEVEL,
  zoomConfigsToData,
} from '../../src/util/zoomUtil';

const zoomConfigValues = {
  ...Array.from({ length: MAX_ZOOM_LEVEL - MIN_ZOOM_LEVEL + 1 }, () => ({
    width: 100,
    height: 100,
  })),
};

describe('computeConfigValues', () => {
  it('computes fixed values', () => {
    const height = 100;
    const width = 100;

    const zoomConfigs: ZoomConfigs = {
      type: 'FIXED',
      values: zoomConfigValues,
      configs: {
        zoom: 2,
        width,
        height,
      },
    };
    const result = computeConfigValues(zoomConfigs);
    expect(Object.keys(result).length).toEqual(
      Object.keys(zoomConfigValues).length,
    );
    expect(result[4]).toEqual({
      width,
      height,
    });
  });
});

describe('zoomConfigsToData', () => {
  it('returns correct output', () => {
    const result = zoomConfigsToData(zoomConfigValues);

    expect(result.length).toEqual(Object.keys(zoomConfigValues).length);
    expect(result[12]).toEqual([100, 100, 12]);
  });
});
