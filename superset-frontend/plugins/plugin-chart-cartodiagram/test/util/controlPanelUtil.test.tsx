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

import {
  ControlPanelConfig,
  CustomControlItem,
} from '@superset-ui/chart-controls';
import {
  getLayerConfig,
  selectedChartMutator,
} from '../../src/util/controlPanelUtil';

describe('getLayerConfig', () => {
  it('exists', () => {
    const layerConfigs: CustomControlItem = {
      name: 'layer_configs',
      config: {
        type: 'dummy',
        renderTrigger: true,
        label: 'Layers',
        default: [
          {
            type: 'XYZ',
            url: 'http://example.com/',
            title: 'dummy title',
            attribution: 'dummy attribution',
          },
        ],
        description: 'The configuration for the map layers',
      },
    };
    const controlPanel: ControlPanelConfig = {
      controlPanelSections: [
        {
          label: 'Configuration',
          expanded: true,
          controlSetRows: [],
        },
        {
          label: 'Map Options',
          expanded: true,
          controlSetRows: [
            [
              {
                name: 'map_view',
                config: {
                  type: 'dummy',
                },
              },
            ],
            [layerConfigs],
          ],
        },
        {
          label: 'Chart Options',
          expanded: true,
          controlSetRows: [],
        },
      ],
    };
    const extractedLayerConfigs = getLayerConfig(controlPanel);

    expect(extractedLayerConfigs).toEqual(layerConfigs);
  });
});

describe('selectedChartMutator', () => {
  it('returns empty array for empty inputs', () => {
    const response = undefined;
    const value = undefined;
    const result = selectedChartMutator(response, value);
    expect(result).toEqual([]);
  });

  it('returns parsed value if response is empty', () => {
    const response = undefined;

    const sliceName = 'foobar';
    const value = JSON.stringify({
      id: 278,
      params: '',
      slice_name: sliceName,
      viz_type: 'pie',
    });

    const result = selectedChartMutator(response, value);

    expect(result[0].label).toEqual(sliceName);
  });

  it('returns response options if no value is chosen', () => {
    const sliceName1 = 'foo';
    const sliceName2 = 'bar';
    const response = {
      result: [
        {
          id: 1,
          params: '{}',
          slice_name: sliceName1,
          viz_type: 'viz1',
        },
        {
          id: 2,
          params: '{}',
          slice_name: sliceName2,
          viz_type: 'viz2',
        },
      ],
    };
    const value = undefined;

    const result = selectedChartMutator(response, value);
    expect(result[0].label).toEqual(sliceName1);
    expect(result[1].label).toEqual(sliceName2);
  });
  it('returns correct result if both value and response are provided', () => {
    // TODO
    expect(selectedChartMutator).toBeDefined();
  });
});
