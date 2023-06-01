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
import { MapChartSizeControlProps } from '@superset-ui/chart-controls';
import { EChartsCoreOption, ECharts } from 'echarts';

export interface EchartsProps {
  height: number;
  width: number;
  echartOptions: EChartsCoreOption;
  eventHandlers?: EventHandlers;
  zrEventHandlers?: EventHandlers;
  selectedValues?: Record<number, string>;
  forceClear?: boolean;
}

export interface EchartsHandler {
  getEchartInstance: () => ECharts | undefined;
}

export type EventHandlers = Record<string, { (props: any): void }>;

export type MapChartSizeChartProps = MapChartSizeControlProps;

export interface CreateDragGraphicOptions {
  data: number[][];
  onWidthDrag: (...arg: any[]) => any;
  onHeightDrag: (...args: any[]) => any;
  barWidth: number;
  chart: any;
}

export interface CreateDragGraphicOption {
  dataItem: number[];
  dataItemIndex: number;
  dataIndex: number;
  onDrag: (...arg: any[]) => any;
  barWidth: number;
  chart: any;
  add: boolean;
}

export interface GetDragGraphicPositionOptions {
  chart: any;
  x: number;
  y: number;
  barWidth: number;
  add: boolean;
}
