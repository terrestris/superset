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

import { SupersetTheme } from '@superset-ui/core';
import { ChartConfigFeature } from '../types';
import ChartWrapper from '../components/ChartWrapper';

/**
 * Create a chart component for a location.
 *
 * @param chartVizType The superset visualization type
 * @param chartConfigs The chart configurations
 * @param chartWidth The chart width
 * @param chartHeight The chart height
 * @param chartTheme The chart theme
 * @returns The chart as React component
 */
export const createChartComponent = (
  chartVizType: string,
  chartConfig: ChartConfigFeature,
  chartWidth: number,
  chartHeight: number,
  chartTheme: SupersetTheme,
) => (
  <ChartWrapper
    vizType={chartVizType}
    chartConfig={chartConfig}
    width={chartWidth}
    height={chartHeight}
    theme={chartTheme}
  />
);
