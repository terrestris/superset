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
import WMSCapabilities from 'ol/format/WMSCapabilities';

export interface WmsStyle {
  name: string;
  title: string;
}

export interface WmsLayerStyles {
  name: string;
  styles: WmsStyle[];
}

export interface WmsAvailableLayer extends WmsLayerStyles {
  title: string;
}

export interface WmsCapabilitiesResult {
  layers?: WmsAvailableLayer[];
  error: boolean;
}

interface CapabilitiesLayer {
  Name?: string;
  Title?: string;
  Style?: { Name?: string; Title?: string }[];
  Layer?: CapabilitiesLayer[];
}

interface Capabilities {
  Capability?: { Layer?: CapabilitiesLayer };
}

const capabilitiesCache = new Map<
  string,
  { layers: WmsAvailableLayer[]; expires: number }
>();
const CACHE_DURATION = 5 * 60 * 1000;

/** Build a capabilities URL while retaining project and authentication parameters. */
export const getWmsCapabilitiesUrl = (serviceUrl: string, version: string) => {
  const url = new URL(serviceUrl.trim());
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Invalid WMS URL');
  }
  const requestParameters = new Set([
    'service',
    'request',
    'version',
    'layers',
    'styles',
    'bbox',
    'width',
    'height',
    'crs',
    'srs',
    'format',
    'transparent',
    'exceptions',
    'tiled',
  ]);
  Array.from(url.searchParams.keys()).forEach(key => {
    if (requestParameters.has(key.toLowerCase())) url.searchParams.delete(key);
  });
  url.searchParams.set('SERVICE', 'WMS');
  url.searchParams.set('REQUEST', 'GetCapabilities');
  url.searchParams.set('VERSION', version);
  url.hash = '';
  return url.toString();
};

/** Read requestable layers and their inherited styles from capabilities. */
export const readWmsAvailableLayers = (xml: string): WmsAvailableLayer[] => {
  const document = new DOMParser().parseFromString(xml, 'text/xml');
  if (
    document.getElementsByTagName('parsererror').length > 0 ||
    !['WMS_Capabilities', 'WMT_MS_Capabilities'].includes(
      document.documentElement.localName,
    )
  ) {
    throw new Error('Invalid WMS capabilities');
  }
  const capabilities = new WMSCapabilities().read(document) as Capabilities;
  const root = capabilities?.Capability?.Layer;
  if (!root) throw new Error('Missing WMS layers');
  const layers = new Map<string, WmsAvailableLayer>();
  const visit = (
    layer: CapabilitiesLayer,
    inheritedStyles: NonNullable<CapabilitiesLayer['Style']> = [],
  ) => {
    const styles = [...(layer.Style ?? []), ...inheritedStyles];
    if (layer.Name && !layers.has(layer.Name)) {
      const namedStyles = new Map<string, WmsStyle>();
      styles.forEach(style => {
        if (style.Name && !namedStyles.has(style.Name)) {
          namedStyles.set(style.Name, {
            name: style.Name,
            title: style.Title || style.Name,
          });
        }
      });
      layers.set(layer.Name, {
        name: layer.Name,
        title: layer.Title || layer.Name,
        styles: Array.from(namedStyles.values()),
      });
    }
    layer.Layer?.forEach(child => visit(child, styles));
  };
  visit(root);
  return Array.from(layers.values());
};

/** Resolve requested layer names in order, including unambiguous workspace names. */
export const selectWmsLayerStyles = (
  layers: WmsAvailableLayer[],
  layersParam: string,
): WmsLayerStyles[] =>
  layersParam.split(',').map(value => {
    const name = value.trim();
    const exact = layers.find(layer => layer.name === name);
    const matches = layers.filter(
      layer => layer.name.split(':').pop() === name,
    );
    const layer = exact ?? (matches.length === 1 ? matches[0] : undefined);
    if (!name || !layer) throw new Error('WMS layer not found');
    return { name, styles: layer.styles };
  });

/** Read named styles for each requested WMS layer. */
export const readWmsLayerStyles = (
  xml: string,
  layersParam: string,
): WmsLayerStyles[] =>
  selectWmsLayerStyles(readWmsAvailableLayers(xml), layersParam);

/** Fetch and briefly cache successful capabilities responses for a WMS service. */
export const getWmsAvailableLayers = async (
  serviceUrl: string,
  version: string,
  signal: AbortSignal,
): Promise<WmsAvailableLayer[]> => {
  const url = getWmsCapabilitiesUrl(serviceUrl, version);
  const cached = capabilitiesCache.get(url);
  if (cached && cached.expires > Date.now()) return cached.layers;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Could not fetch WMS capabilities');
  const xml = await response.text();
  const layers = readWmsAvailableLayers(xml);
  // Bound the cache to avoid retaining every service visited during editing.
  if (capabilitiesCache.size >= 20) capabilitiesCache.clear();
  capabilitiesCache.set(url, { layers, expires: Date.now() + CACHE_DURATION });
  return layers;
};

/** Fetch styles using the same cached catalogue as the layer selector. */
export const getWmsLayerStyles = async (
  serviceUrl: string,
  version: string,
  layersParam: string,
  signal: AbortSignal,
): Promise<WmsLayerStyles[]> =>
  selectWmsLayerStyles(
    await getWmsAvailableLayers(serviceUrl, version, signal),
    layersParam,
  );
