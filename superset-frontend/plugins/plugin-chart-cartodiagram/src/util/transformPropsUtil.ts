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
  DataRecord,
  isTimeseriesDataRecordList,
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
          // eslint-disable-next-line no-underscore-dangle
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
export const groupByLocation = (data: DataRecord[], geomColumn: string) => {
  const locations: LocationConfigMapping = {};

  data.forEach(d => {
    const loc = d[geomColumn] as string;
    if (!loc) {
      return;
    }

    if (!Object.keys(locations).includes(loc)) {
      locations[loc] = [];
    }

    const currentLocation = locations[loc];

    if (Array.isArray(currentLocation)) {
      const item = {
        ...d,
      };
      delete item[geomColumn];
      currentLocation.push(item);
    }
  });

  return locations;
};

/**
 * Strip occurrences of the geom column from the query data in-place.
 *
 * @param queryData The query data
 * @param geomColumn The name of the geom column
 * @returns void
 */
export const stripGeomColumnFromQueryData = (
  queryData: any,
  geomColumn: string,
) => {
  const geomIdx = queryData.colnames?.indexOf(geomColumn);
  if (geomIdx === -1) {
    return;
  }
  queryData.colnames?.splice(geomIdx, 1);
  queryData.coltypes?.splice(geomIdx, 1);
  // eslint-disable-next-line no-param-reassign
  delete queryData.label_map?.[geomColumn];
};

/**
 * Create the charts configuration depending on the referenced Superset chart.
 *
 * @param selectedChart The configuration of the referenced Superset chart
 * @param geomColumn The name of the geometry column
 * @param chartProps The properties provided within this OL plugin
 * @param chartTransformer The transformer function
 * @returns The ECharts configuration
 */
export const getChartConfigs = (
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
    rawFormData: chartFormDataSnake,
    datasource: {},
  };

  const data = chartProps.queriesData[0].data as DataRecord[];
  const data_b = chartProps.queriesData[1]?.data as DataRecord[];
  let dataByLocation: LocationConfigMapping;
  let dataByLocation_b: LocationConfigMapping;

  const chartConfigs: ChartConfig = {
    type: 'FeatureCollection',
    features: [],
  };

  if (!data) {
    return chartConfigs;
  }

  if (isTimeseriesDataRecordList(data)) {
    dataByLocation = groupByLocationTs(data);
  } else {
    dataByLocation = groupByLocation(data, geomColumn);
  }

  if (data_b && isTimeseriesDataRecordList(data_b)) {
    if (isTimeseriesDataRecordList(data_b)) {
      dataByLocation_b = groupByLocationTs(data_b);
    } else {
      dataByLocation = groupByLocation(data_b, geomColumn);
    }
  }

  const { queriesData } = chartProps;
  const queryData = queriesData[0];
  stripGeomColumnFromQueryData(queryData, geomColumn);

  Object.keys(dataByLocation).forEach(location => {
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
    const transformedProps = chartTransformer(config);

    const feature: ChartConfigFeature = {
      type: 'Feature',
      geometry: JSON.parse(location),
      properties: {
        ...transformedProps,
      },
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
