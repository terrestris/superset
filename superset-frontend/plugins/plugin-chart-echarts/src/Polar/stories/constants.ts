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
const SPEED_BANDS = ['0-5 m/s', '5-10 m/s', '10-15 m/s'];

// A synthetic wind rose: PM10 readings binned by wind direction and wind speed
export const dataSource = Array.from({ length: 16 }).flatMap((_, index) => {
  const direction = index * 22.5;
  const weight = 1 + Math.abs(Math.cos(((direction - 225) * Math.PI) / 180));
  return SPEED_BANDS.map((speedBand, bandIndex) => ({
    direction,
    speed_band: speedBand,
    'AVG(pm10)': Math.round(weight * (30 - bandIndex * 8) * 10) / 10,
  }));
});
