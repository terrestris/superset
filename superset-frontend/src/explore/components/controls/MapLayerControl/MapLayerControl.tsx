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
import { styled, t, useTheme } from '@superset-ui/core';
import React, { useCallback } from 'react';
import { ControlComponentProps } from 'src/explore/components/Control';
import ControlHeader from 'src/explore/components/ControlHeader';
import Icons from 'src/components/Icons';
import { LayerConf } from './types';
import { AddControlLabel, LabelsContainer } from '../OptionControls';
import MapLayerOption from './MapLayerOption';
import MapLayerPopoverTrigger from './MapLayerPopoverTrigger';

const defaultItem: LayerConf = {
  type: 'WMS',
  version: '1.3.0',
  title: '',
  url: '',
  layersParam: '',
};

const StyledAddControlLabel = styled(AddControlLabel)`
  margin-bottom: 4px;
`;

export type MapLayerControlProps = ControlComponentProps<LayerConf[]>;

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  value,
  onChange = () => {},
  name,
  label,
  description,
  renderTrigger,
  hovered,
  validationErrors,
}) => {
  const theme = useTheme();

  const onRemoveClick = useCallback(
    (idx: number) => {
      const newValue = value ? [...value] : [];
      newValue.splice(idx, 1);
      onChange(newValue);
    },
    [value, onChange],
  );

  const computeNewValue = useCallback(
    (layerConf: LayerConf, index: number) => {
      const newValue = value ? [...value] : [];
      if (Number.isNaN(index)) {
        newValue.unshift(layerConf);
      } else {
        newValue[index] = layerConf;
      }
      return newValue;
    },
    [value],
  );

  const onPopoverSave = useCallback(
    (layerConf: LayerConf, index: number) => {
      const newValue = computeNewValue(layerConf, index);
      if (!newValue) {
        return;
      }
      onChange(newValue);
    },
    [computeNewValue, onChange],
  );

  const onMoveLayer = useCallback(
    (dragIndex, hoverIndex) => {
      const newValue = value ? [...value] : [];
      [newValue[hoverIndex], newValue[dragIndex]] = [
        newValue[dragIndex],
        newValue[hoverIndex],
      ];
      onChange(newValue);
    },
    [value, onChange],
  );

  const valueRenderer = useCallback(
    (layerConf: LayerConf, index: number) => (
      <MapLayerOption
        key={index}
        index={index}
        layerConf={layerConf}
        onPopoverSave={onPopoverSave}
        onRemoveClick={onRemoveClick}
        onMoveLabel={onMoveLayer}
      />
    ),
    [onMoveLayer, onRemoveClick, onPopoverSave],
  );

  const controlHeaderProps = {
    name,
    label,
    description,
    renderTrigger,
    hovered,
    validationErrors,
  };

  return (
    <div>
      <ControlHeader {...controlHeaderProps} />
      <LabelsContainer>
        <MapLayerPopoverTrigger
          layerConf={defaultItem}
          index={NaN}
          onPopoverSave={onPopoverSave}
          popoverTitle={t('Add layer')}
        >
          <StyledAddControlLabel>
            <Icons.PlusSmall iconColor={theme.colors.grayscale.light1} />
            {t('Add layer')}
          </StyledAddControlLabel>
        </MapLayerPopoverTrigger>
        {value && value.length > 0
          ? value.map((value, index) => valueRenderer(value, index))
          : null}
      </LabelsContainer>
    </div>
  );
};

export default MapLayerControl;
