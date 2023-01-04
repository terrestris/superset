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
import { ControlComponentProps } from '@superset-ui/chart-controls';
import { QueryFormData, TimeseriesDataRecord } from '@superset-ui/core';
import { EChartsCoreOption, ECharts } from 'echarts';
import { CardStyleProps } from 'geostyler/dist/Component/CardStyle/CardStyle';
import { RenderFunction } from 'ol/layer/Layer';
import { Extent } from 'ol/extent';
import Source from 'ol/source/Source';
import { Coordinate } from 'ol/coordinate';
import { DataNode, TreeProps } from 'antd/lib/tree';
import { Map } from 'ol';

export interface SupersetOlPluginStylesProps {
  height: number;
  width: number;
}

export type SupportedVizTypes =
  | 'pie'
  | 'mixed_timeseries'
  | 'echarts_timeseries'
  | 'echarts_timeseries_bar'
  | 'echarts_timeseries_line'
  | 'echarts_timeseries_smooth'
  | 'echarts_timeseries_scatter'
  | 'echarts_timeseries_step';

// TODO check if we can import an existing typing, instead
export type ChartConfig = {
  [key: string]: any;
};

interface SupersetOlPluginCustomizeProps {
  headerText: string;
  geomColumn: string;
  selectedChart: string;
  chartConfigs: ChartConfig;
  chartSize: ZoomConfigs;
  prerenderedZoomLevels: number[];
  chartVizType: SupportedVizTypes;
  layerConfigs: LayerConf[];
  mapView: MapViewConfigs;
  chartBackgroundColor: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  chartBackgroundBorderRadius: number;
  setControlValue: Function;
}

export type SupersetOlPluginQueryFormData = QueryFormData &
  SupersetOlPluginStylesProps &
  SupersetOlPluginCustomizeProps;

export type SupersetOlPluginProps = SupersetOlPluginStylesProps &
  SupersetOlPluginCustomizeProps & {
    data: TimeseriesDataRecord[];
  };

export interface OlChartMapProps extends SupersetOlPluginProps {
  mapId: string;
  olMap: Map;
}

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
  style?: any; // 'geostyler-style'
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

export type EchartsStylesProps = {
  height: number;
  width: number;
};

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

export type SelectedChartConfig = {
  viz_type: string;
  params: {
    [key: string]: any;
  };
};

// TODO: remove any(?)
export type LocationConfigMapping = {
  [key: string]: TimeseriesDataRecord | any[];
};

export interface EditItem {
  layerConf: LayerConf;
  idx: number;
}

export type LayerConfigsControlProps = ControlComponentProps<LayerConf[]>;
export interface LayerConfigsPopoverContentProps {
  onClose?: () => void;
  onSave?: (layerConf: LayerConf) => void;
  layerConf: LayerConf;
}

export type MapViewConfigs = {
  mode: 'FIT_DATA' | 'CUSTOM';
  zoom: number;
  latitude: number;
  longitude: number;
  fixedZoom: number;
  fixedLatitude: number;
  fixedLongitude: number;
};

export type MapViewConfigsControlProps = ControlComponentProps<MapViewConfigs>;

export type ZoomConfigs = ZoomConfigsFixed | ZoomConfigsLinear | ZoomConfigsExp;

export type ChartSizeValues = {
  [index: number]: { width: number; height: number };
};

export interface ZoomConfigsBase {
  type: string;
  configs: {
    zoom: number;
    width: number;
    height: number;
    slope?: number;
    exponent?: number;
  };
  values: ChartSizeValues;
}

export interface ZoomConfigsFixed extends ZoomConfigsBase {
  type: 'FIXED';
}

export interface ZoomConfigsLinear extends ZoomConfigsBase {
  type: 'LINEAR';
  configs: {
    zoom: number;
    width: number;
    height: number;
    slope: number;
    exponent?: number;
  };
}

export interface ZoomConfigsExp extends ZoomConfigsBase {
  type: 'EXP';
  configs: {
    zoom: number;
    width: number;
    height: number;
    slope?: number;
    exponent: number;
  };
}

export type ZoomConfigsControlProps = ControlComponentProps<ZoomConfigs>;
export type ZoomConfigsChartProps = ZoomConfigsControlProps;

export type ChartHtmlElement = {
  htmlElement: HTMLDivElement;
  coordinate: Coordinate;
  width: number;
  height: number;
};

export type ChartsPerZoom = {
  [index: number]: ChartHtmlElement[];
};

export type ChartLayerOptions = {
  chartSizeValues?: ChartSizeValues;
  chartsPerZoom?: ChartsPerZoom;
  chartConfigs?: ChartConfig;
  chartVizType: SupportedVizTypes;
  prerenderedZoomLevels?: number[];
  onMouseOver: (this: GlobalEventHandlers, ev: MouseEvent) => any | undefined;
  onMouseOut: (this: GlobalEventHandlers, ev: MouseEvent) => any | undefined;
  [key: string]: any; // allow custom types like 'name'
  // these properties are copied from OpenLayers
  // TODO: consider extending the OpenLayers options type
  className?: string | undefined;
  opacity?: number | undefined;
  visible?: boolean | undefined;
  extent?: Extent | undefined;
  zIndex?: number | undefined;
  minResolution?: number | undefined;
  maxResolution?: number | undefined;
  minZoom?: number | undefined;
  maxZoom?: number | undefined;
  source?: Source | undefined;
  map?: Map | null | undefined;
  render?: RenderFunction | undefined;
  properties?: { [x: string]: any } | undefined;
};

export interface GeoStylerWrapperProps extends CardStyleProps {
  className?: string;
}

export interface FlatLayerDataNode extends DataNode {
  layerConf: LayerConf;
}

export interface FlatLayerTreeProps {
  layerConfigs: LayerConf[];
  onAddLayer?: () => void;
  onRemoveLayer?: (idx: number) => void;
  onEditLayer?: (layerConf: LayerConf, idx: number) => void;
  onMoveLayer?: (layerConfigs: LayerConf[]) => void;
  draggable?: boolean;
  className?: string;
}

export interface LayerTreeItemProps {
  layerConf: LayerConf;
  onEditClick?: () => void;
  onRemoveClick?: () => void;
  className?: string;
}

export type DropInfoType<T extends TreeProps['onDrop']> = T extends Function
  ? Parameters<T>[0]
  : undefined;

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

export interface ExtentTagProps {
  value: MapViewConfigs;
  onClick: () => void;
  className?: string;
}

export interface MapViewPopoverContentProps {
  onClose: () => void;
  onSave: (currentMapViewConf: MapViewConfigs) => void;
  mapViewConf: MapViewConfigs;
}

export type SupersetOlPluginConstructorOpts = {
  defaultLayers?: LayerConf[];
};
