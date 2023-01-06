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

import { ChartConfigFeature } from '../../src/types';
import { createChartComponent } from '../../src/util/chartUtil';

describe('createChartComponent', () => {
  it('exists', () => {
    expect(createChartComponent).toBeDefined();
  });
  it('return correct type', () => {
    const vizType = 'pie';
    const config: ChartConfigFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [13.353, 48.541],
      },
      properties: {
        formData: {
          adhocFilters: [],
          appliedTimeExtras: {},
          datasource: '24__table',
          vizType: 'pie',
          timeRange: 'No filter',
          groupby: ['nuclide'],
          metric: {
            expressionType: 'SIMPLE',
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
            aggregate: 'COUNT',
            sqlExpression: null,
            isNew: false,
            datasourceWarning: false,
            hasCustomLabel: false,
            label: 'COUNT(nuclide)',
            optionName: 'metric_k6d9mt9zujc_7v9szd1i0pl',
          },
          dashboards: [],
        },
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
            data: [
              'I-131',
              'Te-132',
              'Cs-137',
              'Pb-214',
              'Bi-212',
              'Ru-103',
              'Bi-214',
              'Pb-212',
            ],
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
                  value: 326,
                  name: 'I-131',
                  itemStyle: {
                    color: '#1FA8C9',
                    opacity: 1,
                  },
                },
                {
                  value: 326,
                  name: 'Te-132',
                  itemStyle: {
                    color: '#454E7C',
                    opacity: 1,
                  },
                },
                {
                  value: 326,
                  name: 'Cs-137',
                  itemStyle: {
                    color: '#5AC189',
                    opacity: 1,
                  },
                },
                {
                  value: 326,
                  name: 'Pb-214',
                  itemStyle: {
                    color: '#FF7F44',
                    opacity: 1,
                  },
                },
                {
                  value: 267,
                  name: 'Bi-212',
                  itemStyle: {
                    color: '#666666',
                    opacity: 1,
                  },
                },
                {
                  value: 326,
                  name: 'Ru-103',
                  itemStyle: {
                    color: '#E04355',
                    opacity: 1,
                  },
                },
                {
                  value: 326,
                  name: 'Bi-214',
                  itemStyle: {
                    color: '#FCC700',
                    opacity: 1,
                  },
                },
                {
                  value: 326,
                  name: 'Pb-212',
                  itemStyle: {
                    color: '#A868B7',
                    opacity: 1,
                  },
                },
              ],
            },
          ],
        },
        labelMap: {
          'I-131': ['I-131'],
          'Te-132': ['Te-132'],
          'Cs-137': ['Cs-137'],
          'Pb-214': ['Pb-214'],
          'Bi-212': ['Bi-212'],
          'Ru-103': ['Ru-103'],
          'Bi-214': ['Bi-214'],
          'Pb-212': ['Pb-212'],
        },
        groupby: ['nuclide'],
        selectedValues: {},
      },
    };
    const width = 100;
    const height = 100;

    const result = createChartComponent(vizType, config, width, height);
    const createdType = result.type.name;

    expect(createdType).toEqual('EchartsPie');
  });
});
