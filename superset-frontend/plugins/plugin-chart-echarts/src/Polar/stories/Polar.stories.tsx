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
  SuperChart,
  VizType,
  getChartTransformPropsRegistry,
} from '@superset-ui/core';
import {
  EchartsPolarChartPlugin,
  PolarTransformProps,
} from '@superset-ui/plugin-chart-echarts';
import { withResizableChartDemo } from '@storybook-shared';
import { dataSource } from './constants';

new EchartsPolarChartPlugin().configure({ key: VizType.Polar }).register();

getChartTransformPropsRegistry().registerValue(
  VizType.Polar,
  PolarTransformProps,
);

export default {
  title: 'Chart Plugins/plugin-chart-echarts/Polar',
  decorators: [withResizableChartDemo],
  args: {
    angleAxisType: 'value',
    angleLabelFormat: 'compass',
    clockwise: true,
    seriesType: 'bar',
    showLabels: false,
    showLegend: true,
    stack: true,
    startAngle: 90,
  },
  argTypes: {
    width: { control: 'number' },
    height: { control: 'number' },
    angleAxisType: { control: 'select', options: ['value', 'category'] },
    angleLabelFormat: { control: 'select', options: ['compass', 'degrees'] },
    clockwise: { control: 'boolean' },
    seriesType: { control: 'select', options: ['bar', 'line', 'scatter'] },
    showLabels: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    stack: { control: 'boolean' },
    startAngle: { control: 'number' },
  },
};

export const Polar = ({
  width,
  height,
  ...args
}: {
  width: number;
  height: number;
} & Record<string, unknown>) => (
  <SuperChart
    chartType={VizType.Polar}
    width={width}
    height={height}
    queriesData={[{ data: dataSource }]}
    formData={{
      colorScheme: 'supersetColors',
      datasource: '1__table',
      entity: 'direction',
      metric: 'AVG(pm10)',
      series: 'speed_band',
      vizType: VizType.Polar,
      ...args,
    }}
  />
);
