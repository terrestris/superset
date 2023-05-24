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
import { RadioButtonOption } from '@superset-ui/chart-controls';
import { JsonValue, t } from '@superset-ui/core';
import { Form, Tabs } from 'antd';
import { Data as GsData } from 'geostyler-data';
import { Style as GsStyle } from 'geostyler-style';
import WfsDataParser, {
  RequestParams1_1_0,
  RequestParams2_0_0,
} from 'geostyler-wfs-parser';
import React, { useEffect, useState } from 'react';
import {
  isWfsLayerConf,
  isWmsLayerConf,
  isXyzLayerConf,
} from '../../../typeguards';
import {
  BaseLayerConf,
  LayerConf,
  LayerConfigsPopoverContentProps,
  WfsLayerConf,
  WmsLayerConf,
  XyzLayerConf,
} from '../../../types';
import {
  getServiceVersions,
  hasAllRequiredWfsParams,
} from '../../../util/serviceUtil';
import StyledButtonContainer from '../../styled/StyledButtonContainer';
import StyledCloseButton from '../../styled/StyledCloseButton';
import StyledControlFormItem, {
  StyledControlNumberFormItem,
} from '../../styled/StyledControlFormItem';
import StyledGeoStyler from '../../styled/StyledGeoStyler';
import StyledSaveButton from '../../styled/StyledSaveButton';

// Enum for the different tabs
const LAYER_CONFIG_TABS = {
  LAYER: '1',
  GEOSTYLER: '2',
};

export const LayerConfigsPopoverContent: React.FC<LayerConfigsPopoverContentProps> =
  ({ onClose = () => {}, onSave = () => {}, layerConf }) => {
    const [currentLayerConf, setCurrentLayerConf] =
      useState<LayerConf>(layerConf);
    const initialWmsVersion =
      layerConf.type === 'WMS' ? layerConf.version : undefined;
    const [wmsVersion, setWmsVersion] = useState<string | undefined>(
      initialWmsVersion,
    );
    const initialWfsVersion =
      layerConf.type === 'WFS' ? layerConf.version : undefined;
    const [wfsVersion, setWfsVersion] = useState<string | undefined>(
      initialWfsVersion,
    );
    const [geostylerData, setGeoStylerData] = useState<GsData | undefined>(
      undefined,
    );

    const serviceVersions = getServiceVersions();

    // This is needed to force mounting the form every time
    // we get a new layerConf prop. Otherwise the input fields
    // will not be updated properly, since ControlFormItem only
    // recognises the `value` property once and then handles the
    // values in its on state. Remounting creates a new component
    // and thereby starts with a fresh state.
    const [formKey, setFormKey] = useState<number>(0);

    useEffect(() => {
      setCurrentLayerConf({ ...layerConf });
      setFormKey(oldFormKey => oldFormKey + 1);
    }, [layerConf]);

    const onFieldValueChange = (value: JsonValue, key: string) => {
      setCurrentLayerConf({
        ...currentLayerConf,
        [key]: value,
      });
    };

    const onLayerTypeChange = (value: LayerConf['type']) => {
      if (value === 'WFS') {
        setCurrentLayerConf({
          ...currentLayerConf,
          type: value,
          version: serviceVersions[value][0],
          style: {
            name: 'Default Style',
            rules: [
              {
                name: 'Default Rule',
                symbolizers: [
                  {
                    kind: 'Line',
                    // eslint-disable-next-line theme-colors/no-literal-colors
                    color: '#000000',
                    width: 2,
                  },
                  {
                    kind: 'Mark',
                    wellKnownName: 'circle',
                    // eslint-disable-next-line theme-colors/no-literal-colors
                    color: '#000000',
                  },
                  {
                    kind: 'Fill',
                    // eslint-disable-next-line theme-colors/no-literal-colors
                    color: '#000000',
                  },
                ],
              },
            ],
          },
        } as WfsLayerConf);
      } else if (value === 'XYZ') {
        setCurrentLayerConf({
          ...currentLayerConf,
          type: value,
        } as XyzLayerConf);
      } else {
        setCurrentLayerConf({
          ...currentLayerConf,
          type: value,
          version: serviceVersions[value][0],
        } as WmsLayerConf);
      }
    };

    const onLayerTitleChange = (fieldValue: string) => {
      // TODO should we sanitize the input here already?
      onFieldValueChange(fieldValue, 'title');
    };

    const onLayerUrlChange = (fieldValue: string) => {
      // TODO should we sanitize the input here already?
      onFieldValueChange(fieldValue, 'url');
    };

    const onLayersParamChange = (fieldValue: string) => {
      // TODO should we sanitize the input here already?
      onFieldValueChange(fieldValue, 'layersParam');
    };

    const onTypeNameChange = (fieldValue: string) => {
      // TODO should we sanitize the input here already?
      onFieldValueChange(fieldValue, 'typeName');
    };

    const onWmsVersionChange = (fieldValue: string) => {
      onFieldValueChange(fieldValue, 'version');
      setWmsVersion(fieldValue);
    };

    const onWfsVersionChange = (fieldValue: string) => {
      onFieldValueChange(fieldValue, 'version');
      setWfsVersion(fieldValue);
    };

    const onMaxFeaturesChange = (fieldValue: number) => {
      // TODO should we sanitize the input here already?
      onFieldValueChange(fieldValue, 'maxFeatures');
    };

    const onStyleChange = (fieldValue: GsStyle) => {
      onFieldValueChange(fieldValue, 'style');
    };

    const onAttributionChange = (fieldValue: string) => {
      onFieldValueChange(fieldValue, 'attribution');
    };

    const onCloseClick = () => {
      onClose();
    };

    const onSaveClick = () => {
      const baseConfs: BaseLayerConf = {
        title: currentLayerConf.title,
        url: currentLayerConf.url,
        type: currentLayerConf.type,
        attribution: currentLayerConf.attribution,
      };

      let conf: LayerConf;
      if (isWmsLayerConf(currentLayerConf)) {
        conf = {
          ...baseConfs,
          version: currentLayerConf.version,
          type: currentLayerConf.type,
          layersParam: currentLayerConf.layersParam,
        };
      } else if (isXyzLayerConf(currentLayerConf)) {
        conf = {
          ...baseConfs,
          type: currentLayerConf.type,
        };
      } else {
        conf = {
          ...baseConfs,
          type: currentLayerConf.type,
          version: currentLayerConf.version,
          typeName: currentLayerConf.typeName,
          maxFeatures: currentLayerConf.maxFeatures,
          style: currentLayerConf.style,
        };
      }

      onSave(conf);
    };

    useEffect(() => {
      if (
        !isWfsLayerConf(currentLayerConf) ||
        !hasAllRequiredWfsParams(currentLayerConf)
      ) {
        setGeoStylerData(undefined);
        return undefined;
      }

      const readWfsData = async (conf: WfsLayerConf) => {
        const wfsParser = new WfsDataParser();
        try {
          let requestParams: RequestParams1_1_0 | RequestParams2_0_0 = {} as
            | RequestParams1_1_0
            | RequestParams2_0_0;
          if (conf.version.startsWith('1.')) {
            requestParams = {
              version: conf.version as RequestParams1_1_0['version'],
              maxFeatures: conf.maxFeatures,
              typeName: conf.typeName,
            };
          }
          if (conf.version.startsWith('2.')) {
            requestParams = {
              version: conf.version as RequestParams2_0_0['version'],
              count: conf.maxFeatures,
              typeNames: conf.typeName,
            };
          }

          const gsData = await wfsParser.readData({
            url: conf.url,
            requestParams,
          });
          setGeoStylerData(gsData);
        } catch {
          console.warn('Could not read geostyler data');
          setGeoStylerData(undefined);
        }
      };

      // debounce function
      const timer = setTimeout(() => readWfsData(currentLayerConf), 500);

      return () => {
        clearTimeout(timer);
      };
    }, [currentLayerConf]);

    const layerTabLabel = t('Layer');
    const styleTabLabel = t('Style');
    const layerTypeLabel = t('Layer type');
    const layerTypeDescription = t('The type of the layer');
    const serviceVersionLabel = t('Service version');
    const serviceVersionDescription = t('The version of the service');
    const layersParamLabel = t('Layer Name');
    const layersParamDescription = t(
      'The name of the layer as described in GetCapabilities',
    );
    const layersParamPlaceholder = t('Layer Name');
    const layerTitleLabel = t('Layer title');
    const layerTitleDescription = t('The visible title of the layer');
    const layerTitlePlaceholder = t('Insert Layer title');
    const layerUrlLabel = t('Layer URL');
    const layerUrlDescription = t('The service url of the layer');
    const layerUrlPlaceholder = t('Insert Layer URL');
    const maxFeaturesLabel = t('Max. features');
    const maxFeaturesDescription = t(
      'Maximum number of features to fetch from service',
    );
    const maxFeaturesPlaceholder = t('10000');
    const attributionLabel = t('Attribution');
    const attributionDescription = t('The layer attribution');
    const attributionPlaceholder = t('© Layer attribution');

    const wmsVersionOptions: RadioButtonOption[] = serviceVersions.WMS.map(
      version => [version, version],
    );
    const wfsVersionOptions: RadioButtonOption[] = serviceVersions.WFS.map(
      version => [version, version],
    );

    return (
      <div>
        <Form key={JSON.stringify(formKey)}>
          <Tabs defaultActiveKey={LAYER_CONFIG_TABS.LAYER}>
            <Tabs.TabPane tab={layerTabLabel} key={LAYER_CONFIG_TABS.LAYER}>
              <StyledControlFormItem
                controlType="Input"
                label={layerUrlLabel}
                description={layerUrlDescription}
                placeholder={layerUrlPlaceholder}
                required
                value={currentLayerConf.url}
                name="url"
                onChange={onLayerUrlChange}
              />
              <StyledControlFormItem
                controlType="Select"
                label={layerTypeLabel}
                description={layerTypeDescription}
                options={[
                  ['WMS', t('WMS')],
                  ['WFS', t('WFS')],
                  ['XYZ', t('XYZ')],
                ]}
                required
                value={currentLayerConf.type}
                defaultValue={currentLayerConf.type}
                name="type"
                onChange={onLayerTypeChange}
              />
              {isWmsLayerConf(currentLayerConf) && (
                <StyledControlFormItem
                  controlType="Select"
                  label={serviceVersionLabel}
                  description={serviceVersionDescription}
                  options={wmsVersionOptions}
                  required
                  value={wmsVersion}
                  defaultValue={wmsVersionOptions[0][0] as string}
                  name="wmsVersion"
                  onChange={onWmsVersionChange}
                />
              )}
              {isWfsLayerConf(currentLayerConf) && (
                <StyledControlFormItem
                  controlType="Select"
                  label={serviceVersionLabel}
                  description={serviceVersionDescription}
                  options={wfsVersionOptions}
                  required
                  value={wfsVersion}
                  defaultValue={wfsVersionOptions[0][0] as string}
                  name="wfsVersion"
                  onChange={onWfsVersionChange}
                />
              )}
              {isWmsLayerConf(currentLayerConf) && (
                <StyledControlFormItem
                  controlType="Input"
                  label={layersParamLabel}
                  description={layersParamDescription}
                  placeholder={layersParamPlaceholder}
                  required
                  value={currentLayerConf.layersParam}
                  name="layersParam"
                  onChange={onLayersParamChange}
                />
              )}
              {isWfsLayerConf(currentLayerConf) && (
                <StyledControlFormItem
                  controlType="Input"
                  label={layersParamLabel}
                  description={layersParamDescription}
                  placeholder={layersParamPlaceholder}
                  required
                  value={currentLayerConf.typeName}
                  name="typeName"
                  onChange={onTypeNameChange}
                />
              )}
              <StyledControlFormItem
                controlType="Input"
                label={layerTitleLabel}
                description={layerTitleDescription}
                placeholder={layerTitlePlaceholder}
                required
                value={currentLayerConf.title}
                name="title"
                onChange={onLayerTitleChange}
              />
              {isWfsLayerConf(currentLayerConf) && (
                <StyledControlNumberFormItem
                  controlType="InputNumber"
                  label={maxFeaturesLabel}
                  description={maxFeaturesDescription}
                  placeholder={maxFeaturesPlaceholder}
                  required={false}
                  value={currentLayerConf.maxFeatures}
                  name="maxFeatures"
                  onChange={onMaxFeaturesChange}
                />
              )}
              <StyledControlFormItem
                controlType="Input"
                label={attributionLabel}
                description={attributionDescription}
                placeholder={attributionPlaceholder}
                required={false}
                value={currentLayerConf.attribution}
                name="attribution"
                onChange={onAttributionChange}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={styleTabLabel}
              key={LAYER_CONFIG_TABS.GEOSTYLER}
              disabled={!isWfsLayerConf(currentLayerConf)}
            >
              {isWfsLayerConf(currentLayerConf) && (
                <StyledGeoStyler
                  style={currentLayerConf.style}
                  onStyleChange={onStyleChange}
                  data={geostylerData}
                />
              )}
            </Tabs.TabPane>
          </Tabs>
          <StyledButtonContainer>
            <StyledCloseButton type="default" onClick={onCloseClick}>
              {t('Close')}
            </StyledCloseButton>
            <StyledSaveButton type="primary" onClick={onSaveClick}>
              {t('Save')}
            </StyledSaveButton>
          </StyledButtonContainer>
        </Form>
      </div>
    );
  };

export default LayerConfigsPopoverContent;
