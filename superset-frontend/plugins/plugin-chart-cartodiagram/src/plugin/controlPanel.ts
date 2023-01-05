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
import { t, validateNonEmpty } from '@superset-ui/core';
import { ControlPanelConfig } from '@superset-ui/chart-controls';
import { selectedChartMutator } from '../util/controlPanelUtil';

import LayerConfigsControl from '../components/controls/LayerConfigsControl/LayerConfigsControl';
import ZoomConfigControl from '../components/controls/ZoomConfigControl/ZoomConfigControl';
import { MapViewControl } from '../components/controls/MapViewControl/MapViewControl';
import { MAX_ZOOM_LEVEL, MIN_ZOOM_LEVEL } from '../util/zoomUtil';

const config: ControlPanelConfig = {
  /**
   * The control panel is split into two tabs: "Data" and
   * "Customize". The controls that define the inputs to
   * the chart data request, such as columns and metrics, usually
   * reside within "Data", while controls that affect the visual
   * appearance or functionality of the chart are under the
   * "Customize" section.
   */

  // For control input types, see: superset-frontend/src/explore/components/controls/index.js
  controlPanelSections: [
    {
      label: t('Configuration'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'selected_chart',
            config: {
              type: 'SelectAsyncControl',
              mutator: selectedChartMutator,
              multi: false,
              label: t('Chart'),
              validators: [validateNonEmpty],
              description: t('Choose a chart for displaying on the map'),
              placeholder: t('Select chart'),
              onAsyncErrorMessage: t('Error while fetching charts'),
              mapStateToProps: state => {
                if (state?.datasource?.id) {
                  const datasourceId = state.datasource.id;
                  const query = {
                    columns: ['id', 'slice_name', 'params', 'viz_type'],
                    filters: [
                      {
                        col: 'datasource_id',
                        opr: 'eq',
                        value: datasourceId,
                      },
                      // We can only make a list of excluded viz_types, since
                      // all filters are AND operations and the IN operator seems
                      // not to be supported here.
                      { col: 'viz_type', opr: 'neq', value: 'area' },
                      { col: 'viz_type', opr: 'neq', value: 'bar' },
                      { col: 'viz_type', opr: 'neq', value: 'big_number' },
                      {
                        col: 'viz_type',
                        opr: 'neq',
                        value: 'big_number_total',
                      },
                      { col: 'viz_type', opr: 'neq', value: 'box_plot' },
                      { col: 'viz_type', opr: 'neq', value: 'bubble' },
                      { col: 'viz_type', opr: 'neq', value: 'bullet' },
                      { col: 'viz_type', opr: 'neq', value: 'cal_heatmap' },
                      { col: 'viz_type', opr: 'neq', value: 'chord' },
                      { col: 'viz_type', opr: 'neq', value: 'compare' },
                      { col: 'viz_type', opr: 'neq', value: 'country_map' },
                      { col: 'viz_type', opr: 'neq', value: 'dist_bar' },
                      { col: 'viz_type', opr: 'neq', value: 'dual_line' },
                      { col: 'viz_type', opr: 'neq', value: 'event_flow' },
                      { col: 'viz_type', opr: 'neq', value: 'filter_box' },
                      { col: 'viz_type', opr: 'neq', value: 'funnel' },
                      { col: 'viz_type', opr: 'neq', value: 'treemap_v2' },
                      { col: 'viz_type', opr: 'neq', value: 'gauge_chart' },
                      { col: 'viz_type', opr: 'neq', value: 'graph_chart' },
                      { col: 'viz_type', opr: 'neq', value: 'radar' },
                      { col: 'viz_type', opr: 'neq', value: 'heatmap' },
                      { col: 'viz_type', opr: 'neq', value: 'histogram' },
                      { col: 'viz_type', opr: 'neq', value: 'horizon' },
                      { col: 'viz_type', opr: 'neq', value: 'line' },
                      { col: 'viz_type', opr: 'neq', value: 'line_multi' },
                      { col: 'viz_type', opr: 'neq', value: 'mapbox' },
                      { col: 'viz_type', opr: 'neq', value: 'paired_ttest' },
                      { col: 'viz_type', opr: 'neq', value: 'para' },
                      { col: 'viz_type', opr: 'neq', value: 'partition' },
                      { col: 'viz_type', opr: 'neq', value: 'pivot_table' },
                      { col: 'viz_type', opr: 'neq', value: 'pivot_table_v2' },
                      { col: 'viz_type', opr: 'neq', value: 'rose' },
                      { col: 'viz_type', opr: 'neq', value: 'sankey' },
                      { col: 'viz_type', opr: 'neq', value: 'sunburst' },
                      { col: 'viz_type', opr: 'neq', value: 'table' },
                      { col: 'viz_type', opr: 'neq', value: 'time_pivot' },
                      { col: 'viz_type', opr: 'neq', value: 'time_table' },
                      { col: 'viz_type', opr: 'neq', value: 'treemap' },
                      { col: 'viz_type', opr: 'neq', value: 'word_cloud' },
                      { col: 'viz_type', opr: 'neq', value: 'world_map' },
                      {
                        col: 'viz_type',
                        opr: 'neq',
                        value: 'echarts_timeseries_step',
                      },
                      { col: 'viz_type', opr: 'neq', value: 'filter_select' },
                      { col: 'viz_type', opr: 'neq', value: 'filter_range' },
                      { col: 'viz_type', opr: 'neq', value: 'filter_time' },
                      {
                        col: 'viz_type',
                        opr: 'neq',
                        value: 'filter_timecolumn',
                      },
                      {
                        col: 'viz_type',
                        opr: 'neq',
                        value: 'filter_timegrain',
                      },
                      { col: 'viz_type', opr: 'neq', value: 'tree_chart' },
                      { col: 'viz_type', opr: 'neq', value: 'handlebars' },
                      { col: 'viz_type', opr: 'neq', value: 'cartodiagram' },
                      { col: 'viz_type', opr: 'neq', value: 'filter_groupby' },
                      { col: 'viz_type', opr: 'neq', value: 'deck_arc' },
                      { col: 'viz_type', opr: 'neq', value: 'deck_geojson' },
                      { col: 'viz_type', opr: 'neq', value: 'deck_grid' },
                      { col: 'viz_type', opr: 'neq', value: 'deck_hex' },
                      { col: 'viz_type', opr: 'neq', value: 'deck_multi' },
                      { col: 'viz_type', opr: 'neq', value: 'deck_path' },
                      { col: 'viz_type', opr: 'neq', value: 'deck_polygon' },
                      { col: 'viz_type', opr: 'neq', value: 'deck_scatter' },
                      { col: 'viz_type', opr: 'neq', value: 'deck_screengrid' },
                    ],
                    page: 0,
                    // TODO check why we only retrieve 100 items, even though there are more
                    page_size: 999,
                  };

                  const dataEndpoint = `/api/v1/chart/?q=${JSON.stringify(
                    query,
                  )}`;

                  return { dataEndpoint };
                }
                // could not extract datasource from map
                return {};
              },
            },
          },
        ],
        [
          {
            name: 'geom_column',
            config: {
              type: 'SelectControl',
              label: t('Geometry Column'),
              renderTrigger: false,
              description: t('The name of the geometry column'),
              mapStateToProps: state => ({
                choices: state.datasource?.columns.map(c => [
                  c.column_name,
                  c.column_name,
                ]),
              }),
              validators: [validateNonEmpty],
            },
          },
        ],
      ],
    },
    {
      label: t('Map Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'map_view',
            config: {
              type: MapViewControl,
              renderTrigger: true,
              description: t(
                'The extent of the map on application start. FIT DATA automatically sets the extent so that all data points are included in the viewport. CUSTOM allows users to define the extent manually.',
              ),
              label: t('Extent'),
              dontRefreshOnChange: true,
              default: {
                mode: 'FIT_DATA',
              },
            },
          },
        ],
        [
          {
            // name is referenced in 'index.ts' for setting default value
            name: 'layer_configs',
            config: {
              type: LayerConfigsControl,
              renderTrigger: true,
              label: t('Layers'),
              default: [],
              description: t('The configuration for the map layers'),
            },
          },
        ],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'chart_background_color',
            config: {
              label: t('Background Color'),
              description: t('The background color of the charts.'),
              type: 'ColorPickerControl',
              default: { r: 255, g: 255, b: 255, a: 0.2 },
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'chart_background_border_radius',
            config: {
              label: t('Corner Radius'),
              description: t('The corner radius of the chart background'),
              type: 'SliderControl',
              default: 10,
              min: 0,
              step: 1,
              max: 100,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'chart_size',
            config: {
              type: ZoomConfigControl,
              // set this to true, if we are able to render it fast
              renderTrigger: true,
              default: {
                type: 'FIXED',
                configs: {
                  zoom: 6,
                  width: 100,
                  height: 100,
                  slope: 30,
                  exponent: 2,
                },
                // create an object with keys MIN_ZOOM_LEVEL - MAX_ZOOM_LEVEL
                // that all contain the same initial value
                values: {
                  ...Array.from(
                    { length: MAX_ZOOM_LEVEL - MIN_ZOOM_LEVEL + 1 },
                    () => ({ width: 100, height: 100 }),
                  ),
                },
              },
              label: t('Chart size'),
              description: t('Configure the chart size for each zoom level'),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
