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

import { getChartTransformPropsRegistry } from '@superset-ui/core';
import {
  groupByLocationTs,
  groupByLocation,
  getEchartConfigs,
  parseSelectedChart,
} from '../../src/util/transformPropsUtil';
import { pieChartData } from '../testData';

describe('groupByLocationTs', () => {
  it('exists', () => {
    expect(groupByLocationTs).toBeDefined();
  });
});

describe('groupByLocation', () => {
  const geometryColumn = 'geom';
  const result = groupByLocation(pieChartData, geometryColumn);

  it('groups in the correct count of geometries', () => {
    const countOfGeometries = Object.keys(result).length;
    expect(countOfGeometries).toEqual(2);
  });

  it('groups items with the correct geometry', () => {
    Object.entries(result).forEach(([geom, items]) => {
      const allGeomsAreTheSame = items.every((item: any) => geom === item.geom);
      expect(allGeomsAreTheSame).toEqual(true);
    });
  });
});

describe('getEchartConfigs', () => {
  it('works for pie charts', () => {
    const dummyTransformProps = 'dummyTransformProps';
    const chartQueryBuilderMock: jest.MockedFunction<any> = jest.fn(
      () => dummyTransformProps,
    );

    const transformPropsRegistry = getChartTransformPropsRegistry();
    transformPropsRegistry.registerValue('pie', chartQueryBuilderMock);
    const geomColumn = 'geom';

    const chartTransformer = transformPropsRegistry.get('pie');

    const pieChartConfig = {
      params: {},
      viz_type: 'pie',
    };

    const pieChartProps: any = {
      queriesData: [{}],
    };

    const result = getEchartConfigs(
      pieChartData,
      undefined,
      pieChartConfig,
      geomColumn,
      pieChartProps,
      chartTransformer,
    );

    const countLocations = 2;
    expect(chartQueryBuilderMock.mock.calls).toHaveLength(countLocations);

    const expectedOutput = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [1, 2],
          },
          properties: dummyTransformProps,
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [3, 4],
          },
          properties: dummyTransformProps,
        },
      ],
    };
    expect(result).toEqual(expectedOutput);
  });
});

describe('parseSelectedChart', () => {
  it('parses the inline stringified JSON', () => {
    const selectedChartObject = {
      id: 278,
      params:
        '{"adhoc_filters":[],"applied_time_extras":{},"datasource":"24__table","viz_type":"pie","time_range":"No filter","groupby":["nuclide"],"metric":{"expressionType":"SIMPLE","column":{"advanced_data_type":null,"certification_details":null,"certified_by":null,"column_name":"nuclide","description":null,"expression":null,"filterable":true,"groupby":true,"id":772,"is_certified":false,"is_dttm":false,"python_date_format":null,"type":"TEXT","type_generic":1,"verbose_name":null,"warning_markdown":null},"aggregate":"COUNT","sqlExpression":null,"isNew":false,"datasourceWarning":false,"hasCustomLabel":false,"label":"COUNT(nuclide)","optionName":"metric_k6d9mt9zujc_7v9szd1i0pl"},"dashboards":[]}',
      slice_name: 'pie',
      viz_type: 'pie',
    };

    const selectedChartString = JSON.stringify(selectedChartObject);
    const result = parseSelectedChart(selectedChartString);
    const expectedParams = JSON.parse(selectedChartObject.params);

    expect(result.params).toEqual(expectedParams);
  });
});
