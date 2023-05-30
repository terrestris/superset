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
import React from 'react';
import { css, styled } from '@superset-ui/core';
import { OptionControlLabel } from 'src/explore/components/controls/OptionControls';
import { LayerConf } from './types';
import MapLayerOptionLabel from './MapLayerOptionLabel';
import MapLayerPopoverTrigger from './MapLayerPopoverTrigger';

interface MapLayerOptionProps {
  layerConf: LayerConf;
  onRemoveClick: (index: number) => void;
  onMoveLabel: (dragIndex: number, hoverIndex: number) => void;
  index: number;
  onPopoverSave: (layerConf: LayerConf, index: number) => void;
}

const StyledMapLayerOptionLabel = styled(MapLayerOptionLabel)`
  ${({ theme }) => css`
    & .map-layer-option-type {
      padding-left: 4px;
      padding-right: 4px;
      font-size: ${theme.typography.sizes.xs}px;
      font-family: ${theme.typography.families.monospace};
    }
  `}
`;

export const MapLayerOption: React.FC<MapLayerOptionProps> = ({
  layerConf,
  onRemoveClick,
  onMoveLabel,
  onPopoverSave,
  index,
}) => {
  const onRemove = (e: any) => {
    e?.stopPropagation();
    onRemoveClick(index);
  };

  return (
    <MapLayerPopoverTrigger
      layerConf={layerConf}
      index={index}
      onPopoverSave={onPopoverSave}
      popoverTitle={layerConf.title}
    >
      <OptionControlLabel
        label={
          <StyledMapLayerOptionLabel
            label={layerConf.title}
            type={layerConf.type}
          />
        }
        onRemove={onRemove}
        onMoveLabel={onMoveLabel}
        onDropLabel={() => {}}
        index={index}
        type="MapLayerOptionType"
        withCaret
        isFunction={false}
        multi
      />
    </MapLayerPopoverTrigger>
  );
};

export default MapLayerOption;
