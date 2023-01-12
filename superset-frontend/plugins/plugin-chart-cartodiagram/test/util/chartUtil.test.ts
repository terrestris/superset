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
  const config: ChartConfigFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [13.353, 48.541],
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
  };
  const width = 100;
  const height = 100;

  it('creates pie chart', () => {
    const result = createChartComponent('pie', config, width, height);
    const createdType = result.type.name;

    expect(createdType).toEqual('EchartsPie');
  });

  it('creates timeseries chart', () => {
    const result = createChartComponent(
      'echarts_timeseries_bar',
      config,
      width,
      height,
    );
    const createdType = result.type.name;

    expect(createdType).toEqual('EchartsTimeseries');
  });

  it('creates timeseries line', () => {
    const result = createChartComponent(
      'echarts_timeseries_line',
      config,
      width,
      height,
    );
    const createdType = result.type.name;

    expect(createdType).toEqual('EchartsTimeseries');
  });

  it('creates timeseries smooth', () => {
    const result = createChartComponent(
      'echarts_timeseries_smooth',
      config,
      width,
      height,
    );
    const createdType = result.type.name;

    expect(createdType).toEqual('EchartsTimeseries');
  });

  it('creates timeseries scatter', () => {
    const result = createChartComponent(
      'echarts_timeseries_scatter',
      config,
      width,
      height,
    );
    const createdType = result.type.name;

    expect(createdType).toEqual('EchartsTimeseries');
  });

  it('creates timeseries step', () => {
    const result = createChartComponent(
      'echarts_timeseries_step',
      config,
      width,
      height,
    );
    const createdType = result.type.name;

    expect(createdType).toEqual('EchartsTimeseries');
  });

  it('creates mixed timeseries', () => {
    const result = createChartComponent(
      'mixed_timeseries',
      config,
      width,
      height,
    );
    const createdType = result.type.name;

    expect(createdType).toEqual('EchartsMixedTimeseries');
  });
});
