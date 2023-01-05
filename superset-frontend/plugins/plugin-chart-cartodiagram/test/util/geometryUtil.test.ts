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
import GeoJSON from 'ol/format/GeoJSON';
import {
  getExtentFromFeatures,
  getCoordinateFromGeometry,
} from '../../src/util/geometryUtil';
import { ChartConfig } from '../../src/types';

describe('getCoordinateFromGeometry', () => {
  it('exists', () => {
    expect(getCoordinateFromGeometry).toBeDefined();
  });
});

describe('getExtentFromFeatures', () => {
  it('computes correct extent with valid input', () => {
    const expectedExtent = [1, 2, 3, 4];

    const chartConfig: ChartConfig = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [expectedExtent[0], expectedExtent[1]],
          },
          properties: {
            setDataMask: '',
            labelMap: '',
            labelMapB: '',
            groupby: '',
            selectedValues: '',
            formData: '',
            groupbyB: '',
            seriesBreakdown: '',
            legendData: '',
            echartOptions: '',
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [expectedExtent[2], expectedExtent[3]],
          },
          properties: {
            setDataMask: '',
            labelMap: '',
            labelMapB: '',
            groupby: '',
            selectedValues: '',
            formData: '',
            groupbyB: '',
            seriesBreakdown: '',
            legendData: '',
            echartOptions: '',
          },
        },
      ],
    };

    const features = new GeoJSON().readFeatures(chartConfig);
    const extent = getExtentFromFeatures(features);
    expect(extent).toEqual(expectedExtent);
  });

  it('returns undefined on invalid input', () => {
    const emptyExtent = getExtentFromFeatures([]);
    expect(emptyExtent).toBeUndefined();
  });
});
