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
  ChartProps,
  convertKeysToCamelCase,
  TimeseriesDataRecord,
} from '@superset-ui/core';
import {
  LocationConfigMapping,
  SelectedChartConfig,
  ChartConfig,
  ChartConfigFeature,
} from '../types';

/**
 * Group data by location and timestamp.
 *
 * @param data The incoming dataset
 * @returns The grouped data
 */
export const groupByLocationTs = (data: TimeseriesDataRecord[] | undefined) => {
  const locations: LocationConfigMapping = {};
  if (!data) {
    return locations;
  }
  data.forEach(d => {
    // eslint-disable-next-line no-underscore-dangle
    const timestamp = d.__timestamp;
    if (!timestamp) return;

    const keys = Object.keys(d).filter(k => k !== '__timestamp');

    keys.forEach(k => {
      const separator = ', ';
      const parts = k.split(separator);
      const location = parts[0];
      parts.shift();
      const leftOverKey = parts.join(separator);

      if (!Object.keys(locations).includes(location)) {
        locations[location] = [];
      }

      let dataAtLocation;
      const currentLocation = locations[location];
      if (Array.isArray(currentLocation)) {
        dataAtLocation = currentLocation.find(
          dal => dal.__timestamp === timestamp,
        );
      }
      if (!dataAtLocation) {
        dataAtLocation = {
          __timestamp: timestamp,
        };
        if (Array.isArray(currentLocation)) {
          currentLocation.push(dataAtLocation);
        }
      }
      dataAtLocation[leftOverKey] = d[k];
    });
  });

  return locations;
};

/**
 * Group data by location.
 *
 * @param data The incoming dataset
 * @param geomColumn The name of the geometry column
 * @returns The grouped data
 */
export const groupByLocation = (
  data: TimeseriesDataRecord[],
  geomColumn: string,
) => {
  const locations: LocationConfigMapping = {};

  data.forEach(d => {
    const loc = d[geomColumn] as string;
    if (!loc) {
      // TODO add proper handling
      return;
    }

    if (!Object.keys(locations).includes(loc)) {
      locations[loc] = [];
    }

    const currentLocation = locations[loc];

    if (Array.isArray(currentLocation)) {
      currentLocation.push(d);
    }
  });

  return locations;
};

/**
 * Create the ECharts configuration depending on the referenced Superset chart.
 *
 * @param data The incoming dataset
 * @param data_b Another incoming dataset, if available
 * @param selectedChart The configuration of the referenced Superset chart
 * @param geomColumn The name of the geometry column
 * @param chartProps The properties provided within this OL plugin
 * @param chartTransformer The transformer function
 * @returns The ECharts configuration
 */
export const getEchartConfigs = (
  data: TimeseriesDataRecord[],
  data_b: TimeseriesDataRecord[] | undefined,
  selectedChart: SelectedChartConfig,
  geomColumn: string,
  chartProps: ChartProps,
  chartTransformer: any,
) => {
  const chartFormDataSnake = selectedChart.params;
  const chartFormData = convertKeysToCamelCase(chartFormDataSnake);

  const baseConfig = {
    ...chartProps,
    // We overwrite width and height, which are not needed
    // here, but leads to unnecessary updating of the UI.
    width: null,
    height: null,
    formData: chartFormData,
    // TODO check if we should use chartProps.datasource here
    datasource: {},
  };

  let dataByLocation: LocationConfigMapping;
  let dataByLocation_b: LocationConfigMapping;

  switch (selectedChart.viz_type) {
    case 'pie':
      dataByLocation = groupByLocation(data, geomColumn);
      if (
        Object.keys(chartFormData).includes('groupby') &&
        chartFormData.groupby[0] === geomColumn
      ) {
        chartFormData.groupby.shift();
      }
      break;
    case 'mixed_timeseries':
      dataByLocation = groupByLocationTs(data);
      dataByLocation_b = groupByLocationTs(data_b);
      break;
    default:
      // TODO check if there is a better solution here
      dataByLocation = groupByLocationTs(data);
      break;
  }

  const chartConfigs: ChartConfig = {
    type: 'FeatureCollection',
    features: [],
  };

  Object.keys(dataByLocation).forEach(location => {
    const { queriesData } = chartProps;
    const queryData = queriesData[0];

    const config = {
      ...baseConfig,
      queriesData: [
        {
          ...queryData,
          data: dataByLocation[location],
        },
      ],
    };
    if (dataByLocation_b) {
      const queryDataB = queriesData[1];
      config.queriesData.push({
        ...queryDataB,
        data: dataByLocation_b[location],
      });
    }
    // TODO create proper clone of argument
    const transformedProps = chartTransformer(config);

    const feature: ChartConfigFeature = {
      type: 'Feature',
      geometry: JSON.parse(location),
      properties: transformedProps,
    };

    chartConfigs.features.push(feature);
  });
  return chartConfigs;
};

/**
 * Return the same chart configuration with parsed values for of the stringified "params" object.
 *
 * @param selectedChart Incoming chart configuration
 * @returns Chart configuration with parsed values for "params"
 */
export const parseSelectedChart = (selectedChart: string) => {
  const selectedChartParsed = JSON.parse(selectedChart);
  selectedChartParsed.params = JSON.parse(selectedChartParsed.params);
  return selectedChartParsed;
};
