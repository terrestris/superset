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
import { styled, t } from '@superset-ui/core';
import {
  MapView,
  MapViewControlProps,
  sharedControlComponents,
} from '@superset-ui/chart-controls';
import React, { useState } from 'react';
import ControlHeader from 'src/explore/components/ControlHeader';
import ControlPopover from 'src/explore/components/controls/ControlPopover/ControlPopover';
import Button from 'src/components/Button';
import MapViewPopoverContent from './MapViewPopoverContent';
import ExtentTag from './ExtentTag';

const { RadioButtonControl } = sharedControlComponents;

const StyledRadioButtonContainer = styled.div`
  margin-bottom: 8px;
`;

const StyledButton = styled(Button)`
  margin-top: 8px;
`;

export const MapViewControl: React.FC<MapViewControlProps> = ({
  value,
  onChange = () => {},
  name,
  label,
  description,
  renderTrigger,
  hovered,
  validationErrors,
}) => {
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);

  const onTagClick = () => {
    setPopoverVisible(!popoverVisible);
  };

  const isCustomMode = () => value?.mode === 'CUSTOM';

  const onModeChange = (newValue: 'FIT_DATA' | 'CUSTOM') => {
    if (!value) return;

    const changedValue: MapView = {
      ...value,
      mode: newValue,
    };

    if (newValue === 'FIT_DATA') {
      setPopoverVisible(false);
    }

    onChange(changedValue);
  };

  const onButtonClick = () => {
    if (!value) return;

    const changedValue: MapView = {
      ...value,
      fixedLatitude: value?.latitude,
      fixedLongitude: value?.longitude,
      fixedZoom: value?.zoom,
    };

    onChange(changedValue);
  };

  const onSaveClick = (newValue: MapView) => {
    setPopoverVisible(false);
    onChange(newValue);
  };

  const onCloseClick = () => {
    setPopoverVisible(false);
  };

  const togglePopover = (visibility: boolean) => {
    setPopoverVisible(visibility);
  };

  const popoverTitle = t('Extent');
  const modeNameFitData = t('FIT DATA');
  const modeNameCustom = t('CUSTOM');
  const extentButtonText = t('Use current extent');

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
      <StyledRadioButtonContainer>
        <RadioButtonControl
          options={[
            ['FIT_DATA', modeNameFitData],
            ['CUSTOM', modeNameCustom],
          ]}
          value={value ? value.mode : undefined}
          onChange={onModeChange}
        />
      </StyledRadioButtonContainer>

      {isCustomMode() && value && (
        <ExtentTag onClick={onTagClick} value={value} />
      )}

      {isCustomMode() && value && (
        <ControlPopover
          visible={popoverVisible}
          trigger="click"
          title={popoverTitle}
          placement="right"
          overlayStyle={{
            maxWidth: '400px',
            maxHeight: '700px',
            overflowY: 'auto',
          }}
          content={
            <MapViewPopoverContent
              onClose={onCloseClick}
              onSave={onSaveClick}
              mapView={value}
            />
          }
          onVisibleChange={togglePopover}
        />
      )}

      <br />

      {isCustomMode() && (
        <StyledButton
          onClick={onButtonClick}
          buttonStyle="secondary"
          size="small"
        >
          {extentButtonText}
        </StyledButton>
      )}
    </div>
  );
};

export default MapViewControl;
