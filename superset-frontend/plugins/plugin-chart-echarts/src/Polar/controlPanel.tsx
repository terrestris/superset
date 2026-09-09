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
import { t } from '@apache-superset/core/translation';
import {
  ControlPanelConfig,
  ControlPanelsContainerProps,
  ControlSubSectionHeader,
  D3_FORMAT_DOCS,
  D3_FORMAT_OPTIONS,
  D3_NUMBER_FORMAT_DESCRIPTION_VALUES_TEXT,
  D3_TIME_FORMAT_OPTIONS,
  getStandardizedControls,
  sharedControls,
} from '@superset-ui/chart-controls';
import { legendSection } from '../controls';
import {
  DEFAULT_FORM_DATA,
  PolarAngleAxisType,
  PolarAngleLabelFormat,
  PolarSeriesType,
} from './types';

const {
  angleAxisType,
  angleLabelFormat,
  clockwise,
  numberFormat,
  seriesType,
  showLabels,
  stack,
  startAngle,
} = DEFAULT_FORM_DATA;

const isValueAngleAxis = ({ controls }: ControlPanelsContainerProps) =>
  (controls?.angle_axis_type?.value ?? angleAxisType) ===
  PolarAngleAxisType.Value;

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'entity',
            config: {
              ...sharedControls.entity,
              label: t('Angular dimension'),
              description: t(
                'The column plotted around the circle. Use a numeric column ' +
                  'holding degrees (0-360) with the value angular axis, or any ' +
                  'column with the category angular axis.',
              ),
            },
          },
        ],
        [
          {
            name: 'series',
            config: {
              ...sharedControls.series,
              label: t('Breakdown dimension'),
              description: t(
                'Optional dimension splitting each sector into one series per ' +
                  'value, for example concentration or speed bands.',
              ),
            },
          },
        ],
        ['metric'],
        ['adhoc_filters'],
        ['row_limit'],
        [
          {
            name: 'sort_by_metric',
            config: {
              ...sharedControls.sort_by_metric,
              default: true,
            },
          },
        ],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        ['color_scheme'],
        [
          {
            name: 'series_type',
            config: {
              type: 'SelectControl',
              label: t('Series type'),
              renderTrigger: true,
              default: seriesType,
              choices: [
                [PolarSeriesType.Bar, t('Bar')],
                [PolarSeriesType.Line, t('Line')],
                [PolarSeriesType.Scatter, t('Scatter')],
              ],
              description: t('How each series is rendered on the polar grid'),
            },
          },
        ],
        [
          {
            name: 'stack',
            config: {
              type: 'CheckboxControl',
              label: t('Stacked'),
              renderTrigger: true,
              default: stack,
              description: t(
                'Stack the breakdown dimension series on top of each other',
              ),
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                Boolean(controls?.series?.value),
            },
          },
        ],
        [
          {
            name: 'angle_axis_type',
            config: {
              type: 'SelectControl',
              label: t('Angular axis'),
              renderTrigger: true,
              default: angleAxisType,
              choices: [
                [PolarAngleAxisType.Value, t('Value (degrees)')],
                [PolarAngleAxisType.Category, t('Category')],
              ],
              description: t(
                'Whether the angular dimension holds degrees or discrete categories',
              ),
            },
          },
        ],
        [
          {
            name: 'angle_label_format',
            config: {
              type: 'SelectControl',
              label: t('Angular axis labels'),
              renderTrigger: true,
              default: angleLabelFormat,
              choices: [
                [PolarAngleLabelFormat.Compass, t('Compass points')],
                [PolarAngleLabelFormat.Degrees, t('Degrees')],
              ],
              description: t(
                'Label the angular axis with compass points or raw degrees',
              ),
              visibility: isValueAngleAxis,
            },
          },
        ],
        [
          {
            name: 'sector_width',
            config: {
              type: 'TextControl',
              label: t('Sector width'),
              renderTrigger: true,
              isFloat: true,
              default: null,
              description: t(
                'Width of each bar in degrees. Leave empty to divide the ' +
                  'circle evenly between the plotted angles.',
              ),
              visibility: (props: ControlPanelsContainerProps) =>
                isValueAngleAxis(props) &&
                (props.controls?.series_type?.value ?? seriesType) ===
                  PolarSeriesType.Bar,
            },
          },
        ],
        [
          {
            name: 'start_angle',
            config: {
              type: 'TextControl',
              label: t('Start angle'),
              renderTrigger: true,
              isFloat: true,
              default: startAngle,
              description: t(
                'Position of the first value, in degrees. 90 puts it at the top.',
              ),
            },
          },
        ],
        [
          {
            name: 'clockwise',
            config: {
              type: 'CheckboxControl',
              label: t('Clockwise'),
              renderTrigger: true,
              default: clockwise,
              description: t('Whether the angular axis increases clockwise'),
            },
          },
        ],
        ...legendSection,
        // eslint-disable-next-line react/jsx-key
        [<ControlSubSectionHeader>{t('Labels')}</ControlSubSectionHeader>],
        [
          {
            name: 'show_labels',
            config: {
              type: 'CheckboxControl',
              label: t('Show labels'),
              renderTrigger: true,
              default: showLabels,
              description: t('Whether to display the labels'),
            },
          },
        ],
        [
          {
            name: 'number_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Number format'),
              renderTrigger: true,
              default: numberFormat,
              choices: D3_FORMAT_OPTIONS,
              description: `${D3_FORMAT_DOCS} ${D3_NUMBER_FORMAT_DESCRIPTION_VALUES_TEXT}`,
              tokenSeparators: ['\n', '\t', ';'],
            },
          },
        ],
        ['currency_format'],
        [
          {
            name: 'date_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Date format'),
              renderTrigger: true,
              choices: D3_TIME_FORMAT_OPTIONS,
              default: 'smart_date',
              description: D3_FORMAT_DOCS,
            },
          },
        ],
      ],
    },
  ],
  formDataOverrides: formData => ({
    ...formData,
    metric: getStandardizedControls().shiftMetric(),
  }),
};

export default config;
