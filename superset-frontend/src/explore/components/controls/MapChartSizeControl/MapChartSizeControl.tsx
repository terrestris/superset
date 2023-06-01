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
  MapChartSize,
  MapChartSizeControlProps,
  isExpMapChartSize,
  isLinearMapChartSize,
  sharedControlComponents,
} from '@superset-ui/chart-controls';
import { styled, t } from '@superset-ui/core';
import { Tag } from 'antd';
import React, { useState } from 'react';
import Slider from 'src/components/Slider';
import ControlHeader from 'src/explore/components/ControlHeader';
import {
  computeConfigValues,
  toFixedConfig,
  toLinearConfig,
  toExpConfig,
} from './zoomUtil';
import MapChartSizeChart from './MapChartSizeChart';
import HoverableContainer from './HoverableContainer';

const { RadioButtonControl } = sharedControlComponents;

const StyledRadioButtonContainer = styled.div`
  margin-bottom: 8px;
`;

export const MapChartSizeControl: React.FC<MapChartSizeControlProps> = ({
  value,
  onChange = () => {},
  name,
  label,
  description,
  renderTrigger,
  hovered,
  validationErrors,
}) => {
  const initBaseWidth = value ? value.configs.width : 0;
  const initBaseHeight = value ? value.configs.height : 0;
  const initBaseSlope =
    value?.configs.slope !== undefined ? value.configs.slope : 0;
  const initBaseExponent =
    value?.configs.exponent !== undefined ? value.configs.exponent : 0;

  const [baseWidth, setBaseWidth] = useState<number>(initBaseWidth);
  const [baseHeight, setBaseHeight] = useState<number>(initBaseHeight);
  const [baseSlope, setBaseSlope] = useState<number>(initBaseSlope);
  const [baseExponent, setBaseExponent] = useState<number>(initBaseExponent);

  const onChartChange = (newConfig: MapChartSize) => {
    onChange(newConfig);
  };

  const onBaseWidthChange = (width: number) => {
    setBaseWidth(width);
    if (!value) {
      return;
    }

    const newValue = JSON.parse(JSON.stringify(value));
    newValue.configs.width = width;
    newValue.values = computeConfigValues(newValue);
    onChange(newValue);
  };

  const onBaseHeightChange = (height: number) => {
    setBaseHeight(height);
    if (!value) {
      return;
    }

    const newValue = JSON.parse(JSON.stringify(value));
    newValue.configs.height = height;
    newValue.values = computeConfigValues(newValue);
    onChange(newValue);
  };

  const onBaseSlopeChange = (slope: number) => {
    setBaseSlope(slope);
    if (value && isLinearMapChartSize(value)) {
      const newValue = JSON.parse(JSON.stringify(value));
      newValue.configs.slope = slope;
      newValue.values = computeConfigValues(newValue);
      onChange(newValue);
    }
  };

  const onBaseExponentChange = (exponent: number) => {
    setBaseExponent(exponent);
    if (value && isExpMapChartSize(value)) {
      const newValue = JSON.parse(JSON.stringify(value));
      newValue.configs.exponent = exponent;
      newValue.values = computeConfigValues(newValue);
      onChange(newValue);
    }
  };

  const onShapeChange = (shape: MapChartSize['type']) => {
    if (!value) return;

    const baseValues = {
      width: baseWidth,
      height: baseHeight,
      slope: baseSlope,
      exponent: baseExponent,
      zoom: value?.configs.zoom,
    };

    switch (shape) {
      case 'FIXED': {
        const newFixedConfig = toFixedConfig(baseValues);
        onChange(newFixedConfig);
        break;
      }
      case 'LINEAR': {
        const newLinearConfig = toLinearConfig(baseValues);
        onChange(newLinearConfig);
        break;
      }
      case 'EXP': {
        const newLogConfig = toExpConfig(baseValues);
        onChange(newLogConfig);
        break;
      }
      default:
        break;
    }
  };

  const controlHeaderProps = {
    name,
    label,
    description,
    renderTrigger,
    hovered,
    validationErrors,
  };

  const shapeLabel = t('Shape');
  const shapeDescription = t(
    'Select shape for computing values. "FIXED" sets all zoom levels to the same size. "LINEAR" increases sizes linearly based on specified slope. "EXP" increases sizes exponentially based on specified exponent',
  );
  const baseWidthLabel = t('Base width');
  const baseWidthDescription = t(
    'The width of the current zoom level to compute all widths from',
  );
  const baseHeightLabel = t('Base height');
  const baseHeightDescription = t(
    'The height of the current zoom level to compute all heights from',
  );
  const baseSlopeLabel = t('Base slope');
  const baseSlopeDescription = t(
    'The slope to compute all sizes from. "LINEAR" only',
  );
  const baseExponentLabel = t('Base exponent');
  const baseExponentDescription = t(
    'The exponent to compute all sizes from. "EXP" only',
  );

  return (
    <div>
      <ControlHeader {...controlHeaderProps} />
      <div>
        <HoverableContainer label={shapeLabel} description={shapeDescription}>
          <StyledRadioButtonContainer>
            <RadioButtonControl
              options={[
                ['FIXED', 'FIXED'],
                ['LINEAR', 'LINEAR'],
                ['EXP', 'EXP'],
              ]}
              value={value ? value.type : undefined}
              // name="shape"
              onChange={onShapeChange}
            />
          </StyledRadioButtonContainer>
        </HoverableContainer>
        <HoverableContainer
          label={baseWidthLabel}
          description={baseWidthDescription}
        >
          <Slider
            defaultValue={baseWidth}
            // name="baseWidth"
            onAfterChange={onBaseWidthChange}
            step={1}
            min={0}
            max={500}
          />
        </HoverableContainer>
        <HoverableContainer
          label={baseHeightLabel}
          description={baseHeightDescription}
        >
          <Slider
            defaultValue={baseHeight}
            // name="baseHeight"
            onAfterChange={onBaseHeightChange}
            step={1}
            min={0}
            max={500}
          />
        </HoverableContainer>
        <HoverableContainer
          label={baseSlopeLabel}
          description={baseSlopeDescription}
        >
          <Slider
            defaultValue={baseSlope}
            // name="slope"
            onAfterChange={onBaseSlopeChange}
            disabled={!!(value && !isLinearMapChartSize(value))}
            step={1}
            min={0}
            max={100}
          />
        </HoverableContainer>
        <HoverableContainer
          label={baseExponentLabel}
          description={baseExponentDescription}
        >
          <Slider
            defaultValue={baseExponent}
            // name="exponent"
            onAfterChange={onBaseExponentChange}
            disabled={!!(value && !isExpMapChartSize(value))}
            step={0.2}
            min={0}
            max={3}
          />
        </HoverableContainer>
        <Tag>Current Zoom: {value?.configs.zoom}</Tag>
      </div>
      <MapChartSizeChart
        name="zoomlevels"
        value={value}
        onChange={onChartChange}
      />
    </div>
  );
};

export default MapChartSizeControl;
