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
  LayerConf,
  MapChartSize,
  MapChartSizeValues,
  MapView,
} from '@superset-ui/chart-controls';
import {
  QueryFormData,
  SupersetTheme,
  TimeseriesDataRecord,
} from '@superset-ui/core';
import { Options } from 'ol/layer/Layer';
import { Coordinate } from 'ol/coordinate';
import { Map } from 'ol';
import { Feature, FeatureCollection, Point } from 'geojson';

export interface CartodiagramPluginStylesProps {
  height: number;
  width: number;
  theme: SupersetTheme;
}

export type ChartConfigProperties = any;

export type ChartConfigFeature = Feature<Point, ChartConfigProperties>;
export type ChartConfig = FeatureCollection<
  ChartConfigFeature['geometry'],
  ChartConfigFeature['properties']
>;

interface CartodiagramPluginCustomizeProps {
  geomColumn: string;
  selectedChart: string;
  chartConfigs: ChartConfig;
  chartSize: MapChartSize;
  chartVizType: string;
  layerConfigs: LayerConf[];
  mapView: MapView;
  chartBackgroundColor: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  chartBackgroundBorderRadius: number;
  setControlValue: Function;
}

export type CartodiagramPluginQueryFormData = QueryFormData &
  CartodiagramPluginStylesProps &
  CartodiagramPluginCustomizeProps;

export type CartodiagramPluginProps = CartodiagramPluginStylesProps &
  CartodiagramPluginCustomizeProps & {
    data: TimeseriesDataRecord[];
  };

export interface OlChartMapProps extends CartodiagramPluginProps {
  mapId: string;
  olMap: Map;
}

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

export type ChartHtmlElement = {
  htmlElement: HTMLDivElement;
  coordinate: Coordinate;
  width: number;
  height: number;
};

export interface ChartLayerOptions extends Options {
  chartSizeValues?: MapChartSizeValues;
  chartConfigs?: ChartConfig;
  chartVizType: string;
  chartBackgroundCssColor?: string;
  chartBackgroundBorderRadius?: number;
  name?: string;
  onMouseOver?: (this: GlobalEventHandlers, ev: MouseEvent) => any | undefined;
  onMouseOut?: (this: GlobalEventHandlers, ev: MouseEvent) => any | undefined;
  theme?: SupersetTheme;
}

export type CartodiagramPluginConstructorOpts = {
  defaultLayers?: LayerConf[];
};

export type ChartWrapperProps = {
  vizType: string;
  theme: SupersetTheme;
  width: number;
  height: number;
  chartConfig: ChartConfigFeature;
};
