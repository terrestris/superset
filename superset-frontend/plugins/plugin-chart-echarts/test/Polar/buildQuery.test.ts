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
import { VizType } from '@superset-ui/core';
import buildQuery from '../../src/Polar/buildQuery';
import { EchartsPolarFormData } from '../../src/Polar/types';

const formData = {
  datasource: '5__table',
  granularity_sqla: 'ds',
  viz_type: VizType.Polar,
  entity: 'direction',
  series: 'speed_band',
  metric: 'count',
} as EchartsPolarFormData;

test('should build a grouped query with both dimensions', () => {
  const [query] = buildQuery(formData).queries;

  expect(query.columns).toEqual(['direction', 'speed_band']);
  expect(query.metrics).toEqual(['count']);
});

test('should sort by the metric when sort_by_metric is set', () => {
  expect(
    buildQuery({ ...formData, sort_by_metric: true }).queries[0].orderby,
  ).toEqual([['count', false]]);
  expect(buildQuery(formData).queries[0].orderby).toEqual([]);
});
