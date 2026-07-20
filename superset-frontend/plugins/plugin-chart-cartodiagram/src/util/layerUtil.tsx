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

/**
 * Util for layer related operations.
 */

import { FilterState } from '@superset-ui/core';
import { t } from '@apache-superset/core/translation';
import OlParser from 'geostyler-openlayers-parser';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XyzSource from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';
import {
  WmsLayerConf,
  WfsLayerConf,
  LayerConf,
  XyzLayerConf,
  DataLayerConf,
} from '../types';
import {
  isDataLayerConf,
  isWfsLayerConf,
  isWmsLayerConf,
  isXyzLayerConf,
} from '../typeguards';
import { isVersionBelow } from './serviceUtil';
import {
  LAYER_NAME_PROP,
  MASK_LAYER_NAME,
  PRESENTATION_LAYER_NAME,
  SELECTION_LAYER_NAME,
} from '../constants';

/**
 * Create a WMS layer.
 *
 * @param wmsLayerConf The layer configuration
 *
 * @returns The created WMS layer
 */
export const createWmsLayer = (wmsLayerConf: WmsLayerConf) => {
  const { url, layersParam, version, attribution } = wmsLayerConf;
  return new TileLayer({
    source: new TileWMS({
      url,
      params: {
        LAYERS: layersParam,
        VERSION: version,
      },
      attributions: attribution,
    }),
  });
};

/**
 * Create a XYZ layer.
 *
 * @param xyzLayerConf The layer configuration
 *
 * @returns The created XYZ layer
 */
export const createXyzLayer = (xyzLayerConf: XyzLayerConf) => {
  const { url, attribution } = xyzLayerConf;
  return new TileLayer({
    source: new XyzSource({
      url,
      attributions: attribution,
    }),
  });
};

/**
 * Create a WFS layer.
 *
 * @param wfsLayerConf The layer configuration
 *
 * @returns The created WFS layer
 */
export const createWfsLayer = async (wfsLayerConf: WfsLayerConf) => {
  const {
    url,
    typeName,
    maxFeatures,
    version = '1.1.0',
    style,
    attribution,
  } = wfsLayerConf;

  const wfsSource = new VectorSource({
    format: new GeoJSON(),
    attributions: attribution,
    url: extent => {
      const requestUrl = new URL(url);
      const params = requestUrl.searchParams;
      params.append('service', 'wfs');
      params.append('request', 'GetFeature');
      params.append('outputFormat', 'application/json');
      // TODO: make CRS configurable or take it from Ol Map
      params.append('srsName', 'EPSG:3857');
      params.append('version', version);

      let typeNameQuery = 'typeNames';
      if (isVersionBelow(version, '2.0.0', 'WFS')) {
        typeNameQuery = 'typeName';
      }
      params.append(typeNameQuery, typeName);

      params.append('bbox', extent.join(','));
      if (maxFeatures) {
        let maxFeaturesQuery = 'count';
        if (isVersionBelow(version, '2.0.0', 'WFS')) {
          maxFeaturesQuery = 'maxFeatures';
        }
        params.append(maxFeaturesQuery, maxFeatures.toString());
      }

      return requestUrl.toString();
    },
    strategy: bboxStrategy,
  });

  let writeStyleResult;
  if (style) {
    const olParser = new OlParser();
    writeStyleResult = await olParser.writeStyle(style);
    if (writeStyleResult.errors) {
      console.warn('Could not create ol-style', writeStyleResult.errors);
      return undefined;
    }
  }

  return new VectorLayer({
    source: wfsSource,
    style: writeStyleResult?.output,
  });
};

/**
 * Create a DATA layer.
 *
 * @param dataLayerConf The layer configuration
 *
 * @returns The created DATA layer
 */
export const createDataLayer = async (dataLayerConf: DataLayerConf) => {
  const { attribution, style } = dataLayerConf;
  const dataSource = new VectorSource({
    attributions: attribution,
  });

  let writeStyleResult;
  if (style) {
    const olParser = new OlParser();
    writeStyleResult = await olParser.writeStyle(style);
    if (writeStyleResult.errors) {
      console.warn('Could not create ol-style', writeStyleResult.errors);
      return undefined;
    }
  }

  return new VectorLayer({
    source: dataSource,
    style: writeStyleResult?.output,
  });
};

/**
 * Create a layer instance with the provided configuration.
 *
 * @param layerConf The layer configuration
 *
 * @returns The created layer
 */
export const createLayer = async (layerConf: LayerConf) => {
  let layer;
  if (isWmsLayerConf(layerConf)) {
    layer = createWmsLayer(layerConf);
  } else if (isWfsLayerConf(layerConf)) {
    layer = await createWfsLayer(layerConf);
  } else if (isXyzLayerConf(layerConf)) {
    layer = createXyzLayer(layerConf);
  } else if (isDataLayerConf(layerConf)) {
    layer = await createDataLayer(layerConf);
  } else {
    console.warn('Provided layerconfig is not recognized');
  }
  return layer;
};

/**
 * Remove a managed helper layer from the map by its internal layer name.
 *
 * @param olMap The OpenLayers map
 * @param layerName The internal layer name to remove
 */
export const removeManagedLayer = (olMap: Map, layerName: string) => {
  const layer = olMap
    .getLayers()
    .getArray()
    .filter(l => l.get(LAYER_NAME_PROP) === layerName)
    .pop();
  if (layer) {
    olMap.removeLayer(layer);
  }
};

/**
 * Remove the dedicated selection layer from the map.
 *
 * @param olMap The OpenLayers map
 */
export const removeSelectionLayer = (olMap: Map) => {
  removeManagedLayer(olMap, SELECTION_LAYER_NAME);
};

export const getSelectedFeatures = (
  dataLayers: VectorLayer<VectorSource>[],
  filterState: FilterState,
  crossFilterColumn: string,
) => {
  let selectedFeatures: Feature[] = [];
  if (
    filterState.selectedValues !== null &&
    filterState.selectedValues !== undefined &&
    dataLayers
  ) {
    selectedFeatures = dataLayers.flatMap(dataLayer =>
      dataLayer
        .getSource()!
        .getFeatures()
        .filter(f =>
          filterState.selectedValues.includes(f.get(crossFilterColumn)),
        ),
    );
  }
  return selectedFeatures;
};

export const setSelectionBackgroundOpacity = (
  dataLayers: VectorLayer<VectorSource>[],
  opacity: number,
) => {
  dataLayers.forEach(dataLayer => {
    dataLayer.setOpacity(opacity);
  });
};

/**
 * Create a layer used to highlight the currently selected features.
 *
 * The layer reuses the style of the first data layer so the highlighted
 * features keep the same visual appearance as the original data.
 *
 * @param dataLayers The current data layers
 * @param features The selected features to display
 * @returns The created selection layer
 */
export const createSelectionLayer = (
  dataLayers: VectorLayer<VectorSource>[],
  features: Feature[],
) => {
  const layerStyle = dataLayers[0]?.getStyle();
  const selectionLayer = new VectorLayer({
    source: new VectorSource({
      features,
    }),
    style: layerStyle,
  });
  selectionLayer.set(LAYER_NAME_PROP, SELECTION_LAYER_NAME);
  return selectionLayer;
};

/**
 * Create a presentation layer for derived polygon rendering.
 *
 * This is used for display-only geometries, for example merged polygon
 * perimeters, while interactions continue to rely on the original data layer.
 *
 * @param features The features to render in the presentation layer
 * @param strokeColor The stroke color used for the merged perimeter
 * @param strokeWidth The stroke width used for the merged perimeter
 * @returns The created presentation layer
 */
export const createPresentationLayer = (
  features: Feature[],
  strokeColor?: { r: number; g: number; b: number; a: number },
  strokeWidth = 2,
) => {
  const safeStrokeColor = strokeColor || { r: 0, g: 0, b: 0, a: 1 };
  const presentationLayer = new VectorLayer({
    source: new VectorSource({
      features,
    }),
    style: new Style({
      // Keep only the merged perimeter visible on the presentation layer.
      // eslint-disable-next-line theme-colors/no-literal-colors
      fill: new Fill({ color: 'rgba(255, 255, 255, 0)' }),
      // eslint-disable-next-line theme-colors/no-literal-colors
      stroke: new Stroke({
        color: `rgba(${safeStrokeColor.r}, ${safeStrokeColor.g}, ${safeStrokeColor.b}, ${safeStrokeColor.a})`,
        width: strokeWidth,
      }),
    }),
  });
  presentationLayer.set(LAYER_NAME_PROP, PRESENTATION_LAYER_NAME);
  return presentationLayer;
};

/**
 * Create a layer that visually masks the area outside a focused perimeter.
 *
 * @param maskFeature The polygon feature describing the mask geometry
 * @param color The fill color of the mask
 * @param opacity The fill opacity of the mask, in the range 0..1
 * @returns The created mask layer
 */
export const createMaskLayer = (
  maskFeature: Feature,
  color?: { r: number; g: number; b: number; a: number },
  opacity = 0.65,
) => {
  const safeColor = color || { r: 255, g: 255, b: 255, a: 1 };
  const maskLayer = new VectorLayer({
    source: new VectorSource({
      features: [maskFeature],
    }),
    style: new Style({
      // Keep the active area visible and softly fade the outside.
      // eslint-disable-next-line theme-colors/no-literal-colors
      fill: new Fill({
        color: `rgba(${safeColor.r}, ${safeColor.g}, ${safeColor.b}, ${opacity})`,
      }),
    }),
  });
  maskLayer.set(LAYER_NAME_PROP, MASK_LAYER_NAME);
  return maskLayer;
};

export const getDefaultStyle = () => ({
  name: t('Default Style'),
  rules: [
    {
      name: t('Default Rule'),
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
});
