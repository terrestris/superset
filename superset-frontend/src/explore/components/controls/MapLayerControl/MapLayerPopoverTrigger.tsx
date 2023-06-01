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
import { LayerConf } from '@superset-ui/chart-controls';
import React, { ReactNode, useState } from 'react';
import ControlPopover from 'src/explore/components/controls/ControlPopover/ControlPopover';
import MapLayerPopoverContent from './MapLayerPopoverContent';

interface MapLayerPopoverTriggerProps {
  layerConf: LayerConf;
  index: number;
  popoverTitle: string;
  onPopoverSave?: (layerConf: LayerConf, index: number) => void;
  children: ReactNode;
}

export const MapLayerPopoverTrigger: React.FC<MapLayerPopoverTriggerProps> = ({
  layerConf,
  index,
  onPopoverSave = () => {},
  children,
  popoverTitle,
}) => {
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
  const togglePopover = (visible: boolean) => {
    setPopoverVisible(visible);
  };

  const onSave = (conf: LayerConf) => {
    onPopoverSave(conf, index);
    setPopoverVisible(false);
  };

  return (
    <ControlPopover
      visible={popoverVisible}
      defaultVisible={popoverVisible}
      trigger="click"
      title={popoverTitle ?? layerConf.title}
      placement="right"
      overlayStyle={{
        maxWidth: '400px',
        maxHeight: '700px',
        overflowY: 'auto',
      }}
      content={
        <MapLayerPopoverContent
          layerConf={layerConf}
          onClose={() => togglePopover(false)}
          onSave={onSave}
        />
      }
      onVisibleChange={togglePopover}
      destroyTooltipOnHide
    >
      {children}
    </ControlPopover>
  );
};

export default MapLayerPopoverTrigger;
