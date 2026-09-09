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
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
} from '@superset-ui/core';
import {
  BaseChartProps,
  BaseTransformedProps,
  ContextMenuTransformedProps,
  CrossFilterTransformedProps,
  LegendFormData,
  LegendOrientation,
  LegendType,
} from '../types';
import { DEFAULT_LEGEND_FORM_DATA } from '../constants';

export enum PolarSeriesType {
  Bar = 'bar',
  Line = 'line',
  Scatter = 'scatter',
}

export enum PolarAngleAxisType {
  Value = 'value',
  Category = 'category',
}

export enum PolarAngleLabelFormat {
  Degrees = 'degrees',
  Compass = 'compass',
}

export type EchartsPolarFormData = QueryFormData &
  LegendFormData & {
    angleAxisType: PolarAngleAxisType;
    angleLabelFormat: PolarAngleLabelFormat;
    clockwise: boolean;
    colorScheme?: string;
    dateFormat: string;
    entity: QueryFormColumn;
    metric?: QueryFormMetric;
    numberFormat: string;
    sectorWidth?: number | null;
    series?: QueryFormColumn | null;
    seriesType: PolarSeriesType;
    showLabels: boolean;
    stack: boolean;
    startAngle: number;
  };

export interface EchartsPolarChartProps
  extends BaseChartProps<EchartsPolarFormData> {
  formData: EchartsPolarFormData;
}

export interface PolarChartDataItem {
  name: string;
  value: number | [number, number] | null;
  itemStyle?: {
    color: string;
    opacity: number;
  };
}

// @ts-expect-error viz_type and datasource are supplied by the explore form
export const DEFAULT_FORM_DATA: EchartsPolarFormData = {
  ...DEFAULT_LEGEND_FORM_DATA,
  angleAxisType: PolarAngleAxisType.Value,
  angleLabelFormat: PolarAngleLabelFormat.Compass,
  clockwise: true,
  dateFormat: 'smart_date',
  legendOrientation: LegendOrientation.Top,
  legendType: LegendType.Scroll,
  numberFormat: 'SMART_NUMBER',
  sectorWidth: null,
  seriesType: PolarSeriesType.Bar,
  showLabels: false,
  stack: true,
  startAngle: 90,
};

export type PolarChartTransformedProps =
  BaseTransformedProps<EchartsPolarFormData> &
    ContextMenuTransformedProps &
    CrossFilterTransformedProps;
