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
  CategoricalColorNamespace,
  DataRecord,
  getColumnLabel,
  getMetricLabel,
  getTimeFormatter,
  getValueFormatter,
  tooltipHtml,
  ValueFormatter,
} from '@superset-ui/core';
import type { EChartsCoreOption } from 'echarts/core';
import type {
  BarSeriesOption,
  LineSeriesOption,
  ScatterSeriesOption,
} from 'echarts/charts';
import type { CallbackDataParams } from 'echarts/types/src/util/types';
import {
  DEFAULT_FORM_DATA as DEFAULT_POLAR_FORM_DATA,
  EchartsPolarChartProps,
  EchartsPolarFormData,
  PolarAngleAxisType,
  PolarAngleLabelFormat,
  PolarChartDataItem,
  PolarChartTransformedProps,
  PolarSeriesType,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA, OpacityEnum } from '../constants';
import {
  extractGroupbyLabel,
  getChartPadding,
  getColtypesMapping,
  getLegendProps,
} from '../utils/series';
import { resolveLegendLayout } from '../utils/legendLayout';
import { getDefaultTooltip } from '../utils/tooltip';
import { defaultGrid } from '../defaults';
import { Refs } from '../types';

export const DEGREES_IN_CIRCLE = 360;
const DEGREES_PER_COMPASS_POINT = 22.5;
const COMPASS_POINTS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
];
// Keeps the polar grid clear of the angular axis labels
const RADIUS_MARGIN = 40;
const MIN_RADIUS = 10;

export function formatCompassAngle(degrees: number): string {
  const index = degrees / DEGREES_PER_COMPASS_POINT;
  if (!Number.isInteger(index)) {
    return `${degrees}°`;
  }
  return COMPASS_POINTS[
    ((index % COMPASS_POINTS.length) + COMPASS_POINTS.length) %
      COMPASS_POINTS.length
  ];
}

function getItemValue(params: CallbackDataParams): number | null {
  const { value } = params;
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue === null || rawValue === undefined ? null : Number(rawValue);
}

export default function transformProps(
  chartProps: EchartsPolarChartProps,
): PolarChartTransformedProps {
  const {
    datasource,
    emitCrossFilters,
    filterState,
    formData,
    height,
    hooks,
    inContextMenu,
    queriesData,
    theme,
    width,
  } = chartProps;
  const {
    columnFormats = {},
    currencyFormats = {},
    currencyCodeColumn,
  } = datasource;
  const { data: rawData = [], detected_currency: detectedCurrency } =
    queriesData[0];
  const coltypeMapping = getColtypesMapping(queriesData[0]);

  const {
    angleAxisType,
    angleLabelFormat,
    clockwise,
    colorScheme,
    currencyFormat,
    dateFormat,
    entity,
    legendMargin,
    legendOrientation,
    legendSort,
    legendType,
    metric = '',
    numberFormat,
    sectorWidth,
    series: breakdown,
    seriesType,
    showLabels,
    showLegend,
    sliceId,
    stack,
    startAngle,
  }: EchartsPolarFormData = {
    ...DEFAULT_LEGEND_FORM_DATA,
    ...DEFAULT_POLAR_FORM_DATA,
    ...formData,
  };

  const refs: Refs = {};
  const { setDataMask = () => {}, onContextMenu } = hooks;
  const isValueAxis = angleAxisType === PolarAngleAxisType.Value;

  const metricLabel = getMetricLabel(metric);
  const angleLabel = getColumnLabel(entity);
  const breakdownLabel = breakdown ? getColumnLabel(breakdown) : undefined;
  const groupby = breakdown ? [entity, breakdown] : [entity];
  const groupbyLabels = groupby.map(getColumnLabel);
  const timeFormatter = getTimeFormatter(dateFormat);

  const numberFormatter: ValueFormatter = getValueFormatter(
    metric,
    currencyFormats,
    columnFormats,
    numberFormat,
    currencyFormat,
    undefined,
    rawData,
    currencyCodeColumn,
    detectedCurrency,
  );

  // A value angular axis can only plot rows whose angle is a finite number
  const data = isValueAxis
    ? rawData.filter(datum => Number.isFinite(Number(datum[angleLabel])))
    : rawData;

  const angleKey = (datum: DataRecord): string =>
    isValueAxis
      ? String(Number(datum[angleLabel]))
      : extractGroupbyLabel({
          datum,
          groupby: [angleLabel],
          coltypeMapping,
          timeFormatter,
        });

  const angleKeys: string[] = [];
  const seriesNames: string[] = [];
  const labelMap: Record<string, string[]> = {};
  // series name -> angle key -> data item
  const itemsBySeries = new Map<string, Map<string, PolarChartDataItem>>();

  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

  data.forEach(datum => {
    const name = extractGroupbyLabel({
      datum,
      groupby: groupbyLabels,
      coltypeMapping,
      timeFormatter,
    });
    labelMap[name] = groupbyLabels.map(col => datum[col] as string);

    const seriesName = breakdownLabel
      ? extractGroupbyLabel({
          datum,
          groupby: [breakdownLabel],
          coltypeMapping,
          timeFormatter,
        })
      : metricLabel;
    if (!itemsBySeries.has(seriesName)) {
      itemsBySeries.set(seriesName, new Map());
      seriesNames.push(seriesName);
    }

    const key = angleKey(datum);
    if (!angleKeys.includes(key)) {
      angleKeys.push(key);
    }

    const isFiltered =
      filterState.selectedValues && !filterState.selectedValues.includes(name);
    const metricValue = datum[metricLabel] as number;

    itemsBySeries.get(seriesName)?.set(key, {
      name,
      value: isValueAxis ? [metricValue, Number(key)] : metricValue,
      itemStyle: {
        color: colorFn(seriesName, sliceId),
        opacity: isFiltered
          ? OpacityEnum.SemiTransparent
          : OpacityEnum.NonTransparent,
      },
    });
  });

  if (isValueAxis) {
    angleKeys.sort((a, b) => Number(a) - Number(b));
  }

  const barWidth =
    seriesType === PolarSeriesType.Bar && isValueAxis
      ? sectorWidth || DEGREES_IN_CIRCLE / (angleKeys.length || 1)
      : undefined;

  const { effectiveLegendMargin, effectiveLegendType } = resolveLegendLayout({
    chartHeight: height,
    chartWidth: width,
    legendItems: seriesNames,
    legendMargin,
    orientation: legendOrientation,
    show: showLegend,
    theme,
    type: legendType,
  });
  const chartPadding = getChartPadding(
    showLegend,
    legendOrientation,
    effectiveLegendMargin,
  );

  const flatItemNames: string[] = [];
  const series = seriesNames.map(seriesName => {
    const items = itemsBySeries.get(seriesName) as Map<
      string,
      PolarChartDataItem
    >;
    const seriesData = angleKeys.map(key => {
      const item = items.get(key);
      if (!item) {
        return isValueAxis ? null : { value: null, name: '' };
      }
      flatItemNames.push(item.name);
      return item;
    });

    return {
      type: seriesType,
      coordinateSystem: 'polar',
      name: seriesName,
      animation: false,
      ...(barWidth !== undefined && { barWidth }),
      ...(stack && breakdownLabel && { stack: 'total' }),
      label: {
        show: showLabels,
        position: 'middle',
        color: theme.colorText,
        formatter: (params: CallbackDataParams) => {
          const value = getItemValue(params);
          return value === null ? '' : numberFormatter(value);
        },
      },
      data: seriesData.filter(item => item !== null),
    } as BarSeriesOption | LineSeriesOption | ScatterSeriesOption;
  });

  const selectedValues = (filterState.selectedValues || []).reduce(
    (acc: Record<string, number>, selectedValue: string) => ({
      ...acc,
      [flatItemNames.indexOf(selectedValue)]: selectedValue,
    }),
    {},
  );

  const availableWidth = width - chartPadding.left - chartPadding.right;
  const availableHeight = height - chartPadding.top - chartPadding.bottom;
  const radius = Math.max(
    Math.min(availableWidth, availableHeight) / 2 - RADIUS_MARGIN,
    MIN_RADIUS,
  );
  const centerX = width / 2 + (chartPadding.left - chartPadding.right) / 2;
  const centerY = height / 2 + (chartPadding.top - chartPadding.bottom) / 2;

  const axisLineStyle = { lineStyle: { color: theme.colorSplit } };
  const angleAxis = isValueAxis
    ? {
        type: 'value',
        min: 0,
        max: DEGREES_IN_CIRCLE,
        startAngle,
        clockwise,
        ...(angleLabelFormat === PolarAngleLabelFormat.Compass && {
          interval: DEGREES_PER_COMPASS_POINT * 2,
        }),
        axisLabel: {
          color: theme.colorText,
          formatter: (value: number) =>
            angleLabelFormat === PolarAngleLabelFormat.Compass
              ? formatCompassAngle(value)
              : `${value}°`,
        },
        axisLine: axisLineStyle,
        splitLine: axisLineStyle,
      }
    : {
        type: 'category',
        data: angleKeys,
        startAngle,
        clockwise,
        axisLabel: { color: theme.colorText },
        axisLine: axisLineStyle,
        splitLine: axisLineStyle,
      };

  const echartOptions: EChartsCoreOption = {
    grid: { ...defaultGrid },
    polar: {
      center: [centerX, centerY],
      radius,
    },
    angleAxis,
    radiusAxis: {
      type: 'value',
      axisLabel: {
        color: theme.colorText,
        formatter: (value: number) => numberFormatter(value),
      },
      axisLine: axisLineStyle,
      splitLine: axisLineStyle,
    },
    tooltip: {
      ...getDefaultTooltip(refs),
      show: !inContextMenu,
      trigger: 'item',
      formatter: (params: CallbackDataParams) => {
        const value = getItemValue(params);
        return tooltipHtml(
          [
            [
              params.seriesName ?? metricLabel,
              value === null ? '' : numberFormatter(value),
            ],
          ],
          params.name,
        );
      },
    },
    legend: {
      ...getLegendProps(
        effectiveLegendType,
        legendOrientation,
        showLegend,
        theme,
      ),
      data: [...seriesNames].sort((a, b) => {
        if (!legendSort) return 0;
        return legendSort === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      }),
    },
    series,
  };

  return {
    coltypeMapping,
    echartOptions,
    emitCrossFilters,
    formData,
    groupby,
    height,
    labelMap,
    onContextMenu,
    refs,
    selectedValues,
    setDataMask,
    width,
  };
}
