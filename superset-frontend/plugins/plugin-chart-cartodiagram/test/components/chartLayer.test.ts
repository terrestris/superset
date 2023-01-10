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

import { ChartLayer } from '../../src/components/ChartLayer';
import { ChartLayerOptions } from '../../src/types';

describe('ChartLayer', () => {
  it('creates div and loading mask', () => {
    const options: ChartLayerOptions = {
      chartVizType: 'pie',
    };
    const chartLayer = new ChartLayer(options);

    expect(chartLayer.loadingMask).toBeDefined();
    expect(chartLayer.div).toBeDefined();
  });

  it('can remove chart elements', () => {
    const options: ChartLayerOptions = {
      chartVizType: 'pie',
    };
    const chartLayer = new ChartLayer(options);
    chartLayer.charts = [
      {
        htmlElement: document.createElement('div'),
      },
    ];

    chartLayer.removeAllChartElements();
    expect(chartLayer.charts).toEqual([]);
  });

  it('can update chart elements', () => {
    const chartConfigs = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [13.43533, 54.67567],
          },
          properties: {
            formData: {
              adhocFilters: [],
              appliedTimeExtras: {},
              dashboards: [],
              datasource: '24__table',
              groupby: ['nuclide'],
              metric: {
                aggregate: 'COUNT',
                column: {
                  advanced_data_type: null,
                  certification_details: null,
                  certified_by: null,
                  column_name: 'nuclide',
                  description: null,
                  expression: null,
                  filterable: true,
                  groupby: true,
                  id: 772,
                  is_certified: false,
                  is_dttm: false,
                  python_date_format: null,
                  type: 'TEXT',
                  type_generic: 1,
                  verbose_name: null,
                  warning_markdown: null,
                },
                datasourceWarning: false,
                expressionType: 'SIMPLE',
                hasCustomLabel: false,
                isNew: false,
                label: 'COUNT(nuclide)',
                optionName: 'metric_k6d9mt9zujc_7v9szd1i0pl',
                sqlExpression: null,
              },
              sliceId: 278,
              timeRange: 'No filter',
              vizType: 'pie',
              rowLimit: 10,
            },
            width: null,
            height: null,
            echartOptions: {
              grid: {
                containLabel: true,
              },
              tooltip: {
                appendToBody: true,
                show: true,
                trigger: 'item',
              },
              legend: {
                orient: 'horizontal',
                show: true,
                type: 'scroll',
                top: 0,
                right: 0,
                data: ['Bi-214'],
              },
              graphic: null,
              series: [
                {
                  type: 'pie',
                  left: 0,
                  right: 0,
                  top: 20,
                  bottom: 0,
                  animation: false,
                  radius: ['0%', '70%'],
                  center: ['50%', '50%'],
                  avoidLabelOverlap: true,
                  labelLine: {
                    show: false,
                  },
                  minShowLabelAngle: 18,
                  label: {
                    show: true,
                    color: '#000000',
                    position: 'outer',
                    alignTo: 'none',
                    bleedMargin: 5,
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontWeight: 'bold',
                      backgroundColor: '#FFFFFF',
                    },
                  },
                  data: [
                    {
                      value: 359,
                      name: 'Bi-214',
                      itemStyle: {
                        color: '#1FA8C9',
                        opacity: 1,
                      },
                    },
                  ],
                },
              ],
            },
            emitFilter: false,
            labelMap: {
              'Bi-214': ['Bi-214'],
            },
            groupby: ['nuclide'],
            selectedValues: {},
            refs: {},
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [8.83733, 51.78533],
          },
          properties: {
            formData: {
              adhocFilters: [],
              appliedTimeExtras: {},
              dashboards: [],
              datasource: '24__table',
              groupby: ['nuclide'],
              metric: {
                aggregate: 'COUNT',
                column: {
                  advanced_data_type: null,
                  certification_details: null,
                  certified_by: null,
                  column_name: 'nuclide',
                  description: null,
                  expression: null,
                  filterable: true,
                  groupby: true,
                  id: 772,
                  is_certified: false,
                  is_dttm: false,
                  python_date_format: null,
                  type: 'TEXT',
                  type_generic: 1,
                  verbose_name: null,
                  warning_markdown: null,
                },
                datasourceWarning: false,
                expressionType: 'SIMPLE',
                hasCustomLabel: false,
                isNew: false,
                label: 'COUNT(nuclide)',
                optionName: 'metric_k6d9mt9zujc_7v9szd1i0pl',
                sqlExpression: null,
              },
              sliceId: 278,
              timeRange: 'No filter',
              vizType: 'pie',
              rowLimit: 10,
            },
            width: null,
            height: null,
            echartOptions: {
              grid: {
                containLabel: true,
              },
              tooltip: {
                appendToBody: true,
                show: true,
                trigger: 'item',
              },
              legend: {
                orient: 'horizontal',
                show: true,
                type: 'scroll',
                top: 0,
                right: 0,
                data: ['Pb-214'],
              },
              graphic: null,
              series: [
                {
                  type: 'pie',
                  left: 0,
                  right: 0,
                  top: 20,
                  bottom: 0,
                  animation: false,
                  radius: ['0%', '70%'],
                  center: ['50%', '50%'],
                  avoidLabelOverlap: true,
                  labelLine: {
                    show: false,
                  },
                  minShowLabelAngle: 18,
                  label: {
                    show: true,
                    color: '#000000',
                    position: 'outer',
                    alignTo: 'none',
                    bleedMargin: 5,
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontWeight: 'bold',
                      backgroundColor: '#FFFFFF',
                    },
                  },
                  data: [
                    {
                      value: 347,
                      name: 'Pb-214',
                      itemStyle: {
                        color: '#1FA8C9',
                        opacity: 1,
                      },
                    },
                  ],
                },
              ],
            },
            emitFilter: false,
            labelMap: {
              'Pb-214': ['Pb-214'],
            },
            groupby: ['nuclide'],
            selectedValues: {},
            refs: {},
          },
        },
      ],
    };
    const chartSizeValues = {
      '0': {
        height: 100,
        width: 100,
      },
      '1': {
        height: 100,
        width: 100,
      },
      '2': {
        height: 100,
        width: 100,
      },
      '3': {
        height: 100,
        width: 100,
      },
      '4': {
        height: 100,
        width: 100,
      },
      '5': {
        height: 100,
        width: 100,
      },
      '6': {
        height: 100,
        width: 100,
      },
      '7': {
        height: 100,
        width: 100,
      },
      '8': {
        height: 100,
        width: 100,
      },
      '9': {
        height: 100,
        width: 100,
      },
      '10': {
        height: 100,
        width: 100,
      },
      '11': {
        height: 100,
        width: 100,
      },
      '12': {
        height: 100,
        width: 100,
      },
      '13': {
        height: 100,
        width: 100,
      },
      '14': {
        height: 100,
        width: 100,
      },
      '15': {
        height: 100,
        width: 100,
      },
      '16': {
        height: 100,
        width: 100,
      },
      '17': {
        height: 100,
        width: 100,
      },
      '18': {
        height: 100,
        width: 100,
      },
      '19': {
        height: 100,
        width: 100,
      },
      '20': {
        height: 100,
        width: 100,
      },
      '21': {
        height: 100,
        width: 100,
      },
      '22': {
        height: 100,
        width: 100,
      },
      '23': {
        height: 100,
        width: 100,
      },
      '24': {
        height: 100,
        width: 100,
      },
      '25': {
        height: 100,
        width: 100,
      },
      '26': {
        height: 100,
        width: 100,
      },
      '27': {
        height: 100,
        width: 100,
      },
      '28': {
        height: 100,
        width: 100,
      },
    };
    const options: ChartLayerOptions = {
      chartVizType: 'pie',
      chartConfigs,
      chartSizeValues,
    };
    const chartLayer = new ChartLayer(options);
    console.log(chartLayer.charts);
    chartLayer.createCharts(2);

    expect(false).toBe(true);
  });
});
