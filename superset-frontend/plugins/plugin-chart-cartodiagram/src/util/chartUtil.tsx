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
import React from 'react';

import {
  EchartsMixedTimeseries,
  EchartsPie,
  EchartsTimeseries,
} from '@superset-ui/plugin-chart-echarts';
import { ChartConfigFeature } from '../types';

/**
 * Create a chart component for a location.
 *
 * @param loc The location string
 * @param chartVizType The superset visualization type
 * @param chartConfigs The chart configurations
 * @param chartWidth The chart width
 * @param chartHeight The chart height
 * @returns The chart as React component
 */
export const createChartComponent = (
  chartVizType: string,
  chartConfig: ChartConfigFeature,
  chartWidth: number,
  chartHeight: number,
) => {
  let chartComponent;

  const {
    setDataMask,
    labelMap,
    labelMapB,
    groupby,
    selectedValues,
    formData,
    groupbyB,
    seriesBreakdown,
    legendData,
    echartOptions,
  } = chartConfig.properties;

  switch (chartVizType) {
    case 'pie':
      chartComponent = (
        // TODO fix this typescript error when there is time
        // @ts-ignore
        <EchartsPie
          height={chartHeight}
          width={chartWidth}
          echartOptions={echartOptions}
          setDataMask={setDataMask}
          labelMap={labelMap}
          // TODO probably remove geom grouping
          groupby={groupby}
          selectedValues={selectedValues}
          formData={formData}
        />
      );
      break;
    case 'mixed_timeseries':
      chartComponent = (
        // TODO fix this typescript error when there is time
        // @ts-ignore
        <EchartsMixedTimeseries
          height={chartHeight}
          width={chartWidth}
          echartOptions={echartOptions}
          setDataMask={setDataMask}
          labelMap={labelMap}
          labelMapB={labelMapB}
          // TODO probably remove geom grouping
          groupby={groupby}
          selectedValues={selectedValues}
          formData={formData}
          // TODO probably remove geom grouping
          groupbyB={groupbyB}
          seriesBreakdown={seriesBreakdown}
        />
      );
      break;
    default:
      chartComponent = (
        // TODO fix this typescript error when there is time
        // @ts-ignore
        <EchartsTimeseries
          height={chartHeight}
          width={chartWidth}
          echartOptions={echartOptions}
          setDataMask={setDataMask}
          labelMap={labelMap}
          // TODO probably remove geom grouping
          groupby={groupby}
          selectedValues={selectedValues}
          formData={formData}
          legendData={legendData}
        />
      );
      break;
  }

  return chartComponent;
};
