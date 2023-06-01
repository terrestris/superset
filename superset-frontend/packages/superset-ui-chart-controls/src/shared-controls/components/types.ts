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
import { QueryFormData, JsonValue } from '@superset-ui/core';
import { Style } from 'geostyler-style';
import { ReactNode } from 'react';

/**
 * Props passed to control components.
 *
 * Ref: superset-frontend/src/explore/components/Control.tsx
 */
export interface ControlComponentProps<
  ValueType extends JsonValue = JsonValue,
> {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  formData?: QueryFormData | null;
  value?: ValueType | null;
  validationErrors?: any[];
  hidden?: boolean;
  renderTrigger?: boolean;
  hovered?: boolean;
  onChange?: (value: ValueType) => void;
}

export type MapView = {
  mode: 'FIT_DATA' | 'CUSTOM';
  zoom: number;
  latitude: number;
  longitude: number;
  fixedZoom: number;
  fixedLatitude: number;
  fixedLongitude: number;
};

export type MapViewControlProps = ControlComponentProps<MapView>;

export type MapChartSizeValues = {
  [index: number]: { width: number; height: number };
};

export interface MapChartSizeConf {
  zoom: number;
  width: number;
  height: number;
  slope?: number;
  exponent?: number;
}

export interface LinearMapChartSizeConf extends MapChartSizeConf {
  slope: number;
}

export interface ExpMapChartSizeConf extends MapChartSizeConf {
  exponent: number;
}

export interface BaseMapChartSize<T extends MapChartSizeConf> {
  type: string;
  configs: T;
  values: MapChartSizeValues;
}

export interface FixedMapChartSize extends BaseMapChartSize<MapChartSizeConf> {
  type: 'FIXED';
}

export interface LinearMapChartSize
  extends BaseMapChartSize<LinearMapChartSizeConf> {
  type: 'LINEAR';
}

export interface ExpMapChartSize extends BaseMapChartSize<ExpMapChartSizeConf> {
  type: 'EXP';
}

export type MapChartSize =
  | FixedMapChartSize
  | LinearMapChartSize
  | ExpMapChartSize;

/**
 * Props of a MapChartSizeControl
 */
export type MapChartSizeControlProps = ControlComponentProps<MapChartSize>;

export interface BaseLayerConf {
  title: string;
  url: string;
  type: string;
  attribution?: string;
}

export interface WfsLayerConf extends BaseLayerConf {
  type: 'WFS';
  typeName: string;
  version: string;
  maxFeatures?: number;
  style?: Style;
}

export interface XyzLayerConf extends BaseLayerConf {
  type: 'XYZ';
}

export interface WmsLayerConf extends BaseLayerConf {
  type: 'WMS';
  version: string;
  layersParam: string;
}

export type LayerConf = WmsLayerConf | WfsLayerConf | XyzLayerConf;
