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
import { createRef, useState } from 'react';
import { styled, useTheme } from '@superset-ui/core';
import OlMap from 'ol/Map';
import { ThematicMapPluginProps, ThematicMapPluginStylesProps } from './types';
import OlChartMap from './components/OlChartMap';
import TimeSlider from './components/TimeSlider';
import { TIMESLIDER_HEIGHT } from '../constants';

import 'ol/ol.css';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<ThematicMapPluginStylesProps>`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
`;

const StyledTimeSlider = styled(TimeSlider)`
  height: ${TIMESLIDER_HEIGHT}px;
  width: 90%;
  margin-left: 30px;
  margin-right: 0;
`;

export default function ThematicMapPlugin(props: ThematicMapPluginProps) {
  const {
    data,
    height,
    showTimeslider,
    timeColumn,
    timesliderTooltipFormat,
    width,
  } = props;
  const theme = useTheme();

  const rootElem = createRef<HTMLDivElement>();

  const [mapId] = useState(
    `cartodiagram-plugin-${Math.floor(Math.random() * 1000)}`,
  );
  const [olMap] = useState(new OlMap({}));

  const [timeSliderValue, setTimeSliderValue] = useState<number | undefined>();

  const onSliderChange = (value: number) => {
    setTimeSliderValue(value);
  };

  const mapHeight = showTimeslider ? height - TIMESLIDER_HEIGHT * 2 : height;

  return (
    <Styles ref={rootElem} height={height} width={width} theme={theme}>
      <OlChartMap
        mapId={mapId}
        olMap={olMap}
        timeFilter={showTimeslider ? timeSliderValue : undefined}
        {...props}
        height={mapHeight}
      />
      {showTimeslider && timeColumn && (
        <StyledTimeSlider
          data={data}
          defaultValue={timeSliderValue}
          onChange={onSliderChange}
          timeColumn={timeColumn}
          timesliderTooltipFormat={timesliderTooltipFormat}
        />
      )}
    </Styles>
  );
}
