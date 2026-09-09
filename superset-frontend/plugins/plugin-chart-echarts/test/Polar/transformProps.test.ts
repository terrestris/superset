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
import { ChartProps, VizType } from '@superset-ui/core';
import { supersetTheme } from '@apache-superset/core/theme';
import type { BarSeriesOption } from 'echarts/charts';
import transformProps, {
  formatCompassAngle,
} from '../../src/Polar/transformProps';
import {
  EchartsPolarChartProps,
  EchartsPolarFormData,
  PolarAngleAxisType,
  PolarAngleLabelFormat,
  PolarChartDataItem,
} from '../../src/Polar/types';

const formData: Partial<EchartsPolarFormData> = {
  colorScheme: 'supersetColors',
  datasource: '3__table',
  entity: 'direction',
  metric: 'count',
  series: 'speed_band',
  viz_type: VizType.Polar,
};

const queriesData = [
  {
    colnames: ['direction', 'speed_band', 'count'],
    coltypes: [1, 1, 0],
    data: [
      { direction: 0, speed_band: 'low', count: 10 },
      { direction: 0, speed_band: 'high', count: 4 },
      { direction: 180, speed_band: 'low', count: 7 },
      { direction: 90, speed_band: 'low', count: 3 },
    ],
  },
];

const getChartProps = (overrides: Partial<EchartsPolarFormData> = {}) =>
  new ChartProps({
    formData: { ...formData, ...overrides },
    width: 800,
    height: 600,
    queriesData,
    theme: supersetTheme,
  }) as EchartsPolarChartProps;

test('should transform chart props to a polar bar chart', () => {
  const transformedProps = transformProps(getChartProps());
  const series = transformedProps.echartOptions.series as BarSeriesOption[];

  expect(transformedProps).toEqual(
    expect.objectContaining({
      width: 800,
      height: 600,
      groupby: ['direction', 'speed_band'],
    }),
  );
  expect(series).toHaveLength(2);
  expect(series[0].name).toEqual('low');
  expect(series[0].type).toEqual('bar');
  expect(series[0].coordinateSystem).toEqual('polar');
  expect(series[0].stack).toEqual('total');
});

test('should order angles ascending and encode data as [radius, angle]', () => {
  const transformedProps = transformProps(getChartProps());
  const series = transformedProps.echartOptions.series as BarSeriesOption[];

  expect((series[0].data as PolarChartDataItem[]).map(d => d.value)).toEqual([
    [10, 0],
    [3, 90],
    [7, 180],
  ]);
});

test('should set an explicit sector width on a value angular axis', () => {
  const transformedProps = transformProps(getChartProps());
  const series = transformedProps.echartOptions.series as BarSeriesOption[];

  // three distinct angles share the circle evenly
  expect(series[0].barWidth).toEqual(120);
  expect(
    transformProps(getChartProps({ sectorWidth: 15 })).echartOptions,
  ).toHaveProperty(['series', 0, 'barWidth'], 15);
});

test('should build a label map keyed by the item name', () => {
  const { labelMap } = transformProps(getChartProps());

  expect(labelMap).toEqual({
    '0, low': [0, 'low'],
    '0, high': [0, 'high'],
    '180, low': [180, 'low'],
    '90, low': [90, 'low'],
  });
});

test('should not stack without a breakdown dimension', () => {
  const transformedProps = transformProps(getChartProps({ series: null }));
  const series = transformedProps.echartOptions.series as BarSeriesOption[];

  expect(series).toHaveLength(1);
  expect(series[0].stack).toBeUndefined();
});

test('should drop non numeric angles on a value angular axis', () => {
  const chartProps = new ChartProps({
    formData,
    width: 800,
    height: 600,
    queriesData: [
      {
        data: [
          { direction: 'north', speed_band: 'low', count: 10 },
          { direction: 45, speed_band: 'low', count: 2 },
        ],
      },
    ],
    theme: supersetTheme,
  }) as EchartsPolarChartProps;
  const series = transformProps(chartProps).echartOptions
    .series as BarSeriesOption[];

  expect((series[0].data as PolarChartDataItem[]).map(d => d.value)).toEqual([
    [2, 45],
  ]);
});

test('should use a category angular axis when configured', () => {
  const transformedProps = transformProps(
    getChartProps({ angleAxisType: PolarAngleAxisType.Category }),
  );

  expect(transformedProps.echartOptions.angleAxis).toEqual(
    expect.objectContaining({
      type: 'category',
      data: ['0', '180', '90'],
    }),
  );
});

test('should label a value angular axis with compass points', () => {
  const { angleAxis } = transformProps(getChartProps()).echartOptions as {
    angleAxis: { axisLabel: { formatter: (value: number) => string } };
  };

  expect(angleAxis.axisLabel.formatter(0)).toEqual('N');
  expect(angleAxis.axisLabel.formatter(225)).toEqual('SW');
});

test('should label a value angular axis with degrees when configured', () => {
  const { angleAxis } = transformProps(
    getChartProps({ angleLabelFormat: PolarAngleLabelFormat.Degrees }),
  ).echartOptions as {
    angleAxis: { axisLabel: { formatter: (value: number) => string } };
  };

  expect(angleAxis.axisLabel.formatter(225)).toEqual('225°');
});

test('formatCompassAngle falls back to degrees off the compass rose', () => {
  expect(formatCompassAngle(22.5)).toEqual('NNE');
  expect(formatCompassAngle(360)).toEqual('N');
  expect(formatCompassAngle(10)).toEqual('10°');
});
