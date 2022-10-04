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
  groupByLocationTs,
  groupByLocation,
  getChartConfigs,
  parseSelectedChart,
} from '../../src/util/transformPropsUtil';
import {
  timeseriesChartData,
  nonTimeSeriesChartData,
  groupedTimeseriesChartData,
  geom1,
  geom2,
} from '../testData';

describe('transformPropsUtil', () => {
  describe('groupByLocationTs', () => {
    it('returns empty result when no timestamps provided', () => {
      const result = groupByLocationTs(nonTimeSeriesChartData);
      expect(result).toEqual({});
    });

    it('groups in the correct count of geometries', () => {
      const result = groupByLocationTs(timeseriesChartData);

      const countGeometries = Object.keys(result).length;
      expect(countGeometries).toEqual(2);
    });

    it('removes the geometry from the data field for grouped data', () => {
      const result = groupByLocationTs(groupedTimeseriesChartData);

      expect(result).toEqual(
        expect.objectContaining({
          [geom1]: expect.arrayContaining([
            expect.objectContaining({
              __timestamp: 1564275000000,
              apple: 347,
              lemon: 352,
            }),
          ]),
        }),
      );
    });
  });

  describe('groupByLocation', () => {
    it('groups in the correct count of geometries', () => {
      const geometryColumn = 'geom';
      const result = groupByLocation(nonTimeSeriesChartData, geometryColumn);
      const countOfGeometries = Object.keys(result).length;
      expect(countOfGeometries).toEqual(2);
    });

    it('groups items by same geometry', () => {
      const geometryColumn = 'geom';
      const result = groupByLocation(nonTimeSeriesChartData, geometryColumn);
      const allGeom1 = result[geom1].length === 6;
      const allGeom2 = result[geom2].length === 4;
      expect(allGeom1 && allGeom2).toBe(true);
    });
  });

  describe('getChartConfigs', () => {
    let chartTransformer: jest.MockedFunction<any>;
    const geomColumn = 'geom';
    const pieChartConfig = {
      params: {},
      viz_type: 'pie',
    };
    const chartProps: any = {
      queriesData: [
        {
          data: nonTimeSeriesChartData,
        },
      ],
    };
    beforeEach(() => {
      chartTransformer = jest.fn();
    });

    it('calls the transformProps function for every location', () => {
      getChartConfigs(pieChartConfig, geomColumn, chartProps, chartTransformer);

      expect(chartTransformer).toHaveBeenCalledTimes(2);
    });
    it('returns a geojson', () => {
      const result = getChartConfigs(
        pieChartConfig,
        geomColumn,
        chartProps,
        chartTransformer,
      );

      expect(result).toEqual(
        expect.objectContaining({
          type: 'FeatureCollection',
          features: expect.arrayContaining([
            expect.objectContaining({
              type: 'Feature',
            }),
          ]),
        }),
      );
    });
    it('returns a feature for each location', () => {
      const result = getChartConfigs(
        pieChartConfig,
        geomColumn,
        chartProps,
        chartTransformer,
      );
      expect(result.features).toHaveLength(2);
      expect(result.features[0].geometry).toEqual(JSON.parse(geom1));
      expect(result.features[1].geometry).toEqual(JSON.parse(geom2));
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
});
