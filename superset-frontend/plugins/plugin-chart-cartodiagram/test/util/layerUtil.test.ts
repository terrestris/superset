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

import Style from 'ol/style/Style';
import { WfsLayerConf } from '../../src/types';
import {
  createLayer,
  createWfsLayer,
  createWmsLayer,
  createXyzLayer,
} from '../../src/util/layerUtil';

describe('layerUtil', () => {
  describe('createWmsLayer', () => {
    test('exists', () => {
      // function is trivial
      expect(createWmsLayer).toBeDefined();
    });
  });

  describe('createWfsLayer', () => {
    test('properly applies style', async () => {
      const colorToExpect = '#123456';
      const fillColor = '#ff0000';

      const wfsLayerConf: WfsLayerConf = {
        title: 'osm:osm-fuel',
        url: 'https://ows-demo.terrestris.de/geoserver/osm/wfs',
        type: 'WFS',
        version: '2.0.2',
        typeName: 'osm:osm-fuel',
        style: {
          name: 'Default Style',
          rules: [
            {
              name: 'Default Rule',
              symbolizers: [
                {
                  kind: 'Line',
                  color: '#000000',
                  width: 2,
                },
                {
                  kind: 'Mark',
                  wellKnownName: 'circle',
                  color: colorToExpect,
                },
                {
                  kind: 'Fill',
                  color: fillColor,
                },
              ],
            },
          ],
        },
      };

      const wfsLayer = await createWfsLayer(wfsLayerConf);

      const style = wfsLayer!.getStyle();
      expect(Array.isArray(style)).toBe(true);
      if (!Array.isArray(style)) {
        return;
      }
      const styleArray = style.filter(
        (styleEntry): styleEntry is Style => styleEntry instanceof Style,
      );
      expect(styleArray).toHaveLength(3);

      const colorAtLayer = styleArray[2].getFill()?.getColor();
      expect(colorAtLayer).toEqual(fillColor);
    });
  });

  describe('createXyzLayer', () => {
    test('exists', () => {
      // function is trivial
      expect(createXyzLayer).toBeDefined();
    });
  });

  describe('createLayer', () => {
    test('exists', () => {
      expect(createLayer).toBeDefined();
    });
  });
});
