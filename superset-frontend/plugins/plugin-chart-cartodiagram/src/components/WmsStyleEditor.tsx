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
import { FC, useEffect, useRef, useState, useMemo } from 'react';
import { t } from '@apache-superset/core/translation';
import { Form, Select } from '@superset-ui/core/components';
import { WmsStyleEditorProps } from '../types';
import { isWmsLayerConf } from '../typeguards';
import {
  getWmsLayerStyles,
  selectWmsLayerStyles,
  WmsLayerStyles,
} from '../util/wmsCapabilitiesUtil';

/** Choose server-rendered WMS styles without invoking the vector style editor. */
export const WmsStyleEditor: FC<WmsStyleEditorProps> = ({
  layerConf,
  capabilities,
  onChange,
  onAvailabilityChange,
  onErrorChange,
}) => {
  const conf = isWmsLayerConf(layerConf) ? layerConf : undefined;
  const url = conf?.url?.trim() ?? '';
  const version = conf?.version ?? '';
  const layersParam = conf?.layersParam?.trim() ?? '';
  const [result, setResult] = useState<{
    key: string;
    layers: WmsLayerStyles[];
    error: boolean;
  }>();
  const selectedStyles = conf?.stylesParam ?? '';
  const selectedStylesRef = useRef(selectedStyles);
  selectedStylesRef.current = selectedStyles;
  const previousRequest = useRef<string>();
  const requestKey = JSON.stringify([url, version, layersParam]);

  const catalogueStyles = useMemo(() => {
    if (!capabilities || !layersParam) return { layers: [], error: false };
    if (capabilities.error) return { layers: [], error: true };
    if (!capabilities.layers) return { layers: [], error: false };
    try {
      return {
        layers: selectWmsLayerStyles(capabilities.layers, layersParam),
        error: false,
      };
    } catch {
      return { layers: [], error: true };
    }
  }, [capabilities, layersParam]);

  useEffect(() => {
    onAvailabilityChange(false);
    onErrorChange?.(false);
    if (previousRequest.current && previousRequest.current !== requestKey) {
      onChange({ stylesParam: '' });
    }
    previousRequest.current = requestKey;
    if (!url || !version || !layersParam) return undefined;
    if (capabilities) {
      onErrorChange?.(catalogueStyles.error);
      onAvailabilityChange(
        !catalogueStyles.error &&
          catalogueStyles.layers.length > 0 &&
          (catalogueStyles.layers.some(layer => layer.styles.length > 1) ||
            Boolean(selectedStylesRef.current)),
      );
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const styles = await getWmsLayerStyles(
          url,
          version,
          layersParam,
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, layers: styles, error: false });
          onAvailabilityChange(
            styles.some(layer => layer.styles.length > 1) ||
              Boolean(selectedStylesRef.current),
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, layers: [], error: true });
          onAvailabilityChange(false);
          onErrorChange?.(true);
        }
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    url,
    version,
    layersParam,
    requestKey,
    onChange,
    onAvailabilityChange,
    onErrorChange,
    capabilities,
    catalogueStyles,
  ]);

  const layerStyles = capabilities
    ? catalogueStyles.layers
    : result?.key === requestKey
      ? result.layers
      : [];
  const error = capabilities
    ? catalogueStyles.error
    : result?.key === requestKey && result.error;

  if (!conf) return null;
  if (error) return null;
  return (
    <>
      {layerStyles.map((layer, index) => {
        const selected = selectedStyles.split(',')[index] ?? '';
        const options = [
          { value: '', label: t('Server default') },
          ...layer.styles.map(style => ({
            value: style.name,
            label: style.title,
          })),
        ];
        if (selected && !layer.styles.some(style => style.name === selected)) {
          options.push({ value: selected, label: selected });
        }
        return (
          <Form.Item key={`${layer.name}-${index}`} label={t('SLD')}>
            <Select
              aria-label={t('WMS style for %s', layer.name)}
              value={selected}
              options={options}
              onChange={value => {
                const styles = layerStyles.map(
                  (_, position) => selectedStyles.split(',')[position] ?? '',
                );
                styles[index] = String(value ?? '');
                onChange({
                  stylesParam: styles.every(style => !style)
                    ? ''
                    : styles.join(','),
                });
              }}
            />
          </Form.Item>
        );
      })}
    </>
  );
};
