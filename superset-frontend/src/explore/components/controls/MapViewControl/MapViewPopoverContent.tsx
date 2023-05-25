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
import React, { useEffect, useState } from 'react';
import Button from 'src/components/Button';
import ControlHeader from 'src/explore/components/ControlHeader';
import ErrorBoundary from 'src/components/ErrorBoundary';
import { InputNumber } from 'src/components/Input';
import { InputValueType } from './MapViewControl';

interface MapViewPopoverContentProps {
  onClose: () => void;
  onSave: (currentMapViewConf: InputValueType) => void;
  mapViewConf: InputValueType;
}

const MapViewActionsContainer = styled.div`
  margin-top: ${({ theme }) => theme.gridUnit * 2}px;
`;

const StyledInputNumber = styled(InputNumber)`
  width: 100%;
`;

export const MapViewPopoverContent: React.FC<MapViewPopoverContentProps> = ({
  onClose = () => {},
  onSave = () => {},
  mapViewConf,
}) => {
  const [currentMapViewConf, setCurrentMapViewConf] =
    useState<InputValueType>(mapViewConf);

  useEffect(() => {
    setCurrentMapViewConf({ ...mapViewConf });
  }, [mapViewConf]);

  const onCloseClick = () => {
    setCurrentMapViewConf({ ...mapViewConf });

    onClose();
  };

  const onSaveClick = () => {
    onSave(currentMapViewConf);
  };

  const onZoomChange = (zoom: number) => {
    setCurrentMapViewConf({
      ...currentMapViewConf,
      fixedZoom: zoom,
    });
  };

  const onLatitudeChange = (latitude: number) => {
    setCurrentMapViewConf({
      ...currentMapViewConf,
      fixedLatitude: latitude,
    });
  };

  const onLongitudeChange = (longitude: number) => {
    setCurrentMapViewConf({
      ...currentMapViewConf,
      fixedLongitude: longitude,
    });
  };

  return (
    <div>
      <ErrorBoundary>
        <div>
          <ControlHeader label={t('Zoom')} />
          <StyledInputNumber
            value={
              currentMapViewConf ? currentMapViewConf.fixedZoom : undefined
            }
            min={0}
            max={28}
            step={1}
            onChange={onZoomChange}
          />
        </div>
        <div>
          <ControlHeader label={t('Latitude')} />
          <StyledInputNumber
            value={
              currentMapViewConf ? currentMapViewConf.fixedLatitude : undefined
            }
            onChange={onLatitudeChange}
            min={-90}
            max={90}
          />
        </div>
        <div>
          <ControlHeader label={t('Longitude')} />
          <StyledInputNumber
            value={
              currentMapViewConf ? currentMapViewConf.fixedLongitude : undefined
            }
            onChange={onLongitudeChange}
            min={-180}
            max={180}
          />
        </div>
        <MapViewActionsContainer>
          <Button buttonSize="small" onClick={onCloseClick} cta>
            {t('Close')}
          </Button>
          <Button
            buttonStyle="primary"
            buttonSize="small"
            className="m-r-5"
            onClick={onSaveClick}
            cta
          >
            {t('Save')}
          </Button>
        </MapViewActionsContainer>
      </ErrorBoundary>
    </div>
  );
};

export default MapViewPopoverContent;
