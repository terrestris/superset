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
import {
  getWmsCapabilitiesUrl,
  getWmsAvailableLayers,
  readWmsAvailableLayers,
  getWmsLayerStyles,
  readWmsLayerStyles,
} from '../../src/util/wmsCapabilitiesUtil';

const layerXml = `
  <Layer>
    <Title>Root</Title>
    <Style><Name>default</Name><Title>Default</Title></Style>
    <Layer><Title>Group</Title>
      <Layer><Name>workspace:land</Name><Title>Land</Title>
        <Style><Name>binary</Name><Title>Binary land use</Title></Style>
      </Layer>
      <Layer><Name>roads</Name><Title>Roads</Title></Layer>
    </Layer>
  </Layer>`;

const capabilities = (version = '1.3.0', layers = layerXml) =>
  version === '1.3.0'
    ? `<WMS_Capabilities version="1.3.0" xmlns="http://www.opengis.net/wms"><Capability>${layers}</Capability></WMS_Capabilities>`
    : `<WMT_MS_Capabilities version="1.1.1"><Capability>${layers}</Capability></WMT_MS_Capabilities>`;

afterEach(() => jest.restoreAllMocks());

test('builds a capabilities request without losing QGIS MAP or access parameters', () => {
  const url = new URL(
    getWmsCapabilitiesUrl(
      'https://example.org/wms?MAP=project.qgz&token=abc&request=GetMap&VERSION=1.1.1&LAYERS=roads&STYLES=old',
      '1.3.0',
    ),
  );
  expect(Object.fromEntries(url.searchParams)).toEqual({
    MAP: 'project.qgz',
    token: 'abc',
    SERVICE: 'WMS',
    REQUEST: 'GetCapabilities',
    VERSION: '1.3.0',
  });
});

test.each(['1.3.0', '1.1.1'])(
  'reads nested and inherited styles in WMS %s',
  version => {
    expect(readWmsLayerStyles(capabilities(version), 'workspace:land')).toEqual(
      [
        {
          name: 'workspace:land',
          styles: [
            { name: 'binary', title: 'Binary land use' },
            { name: 'default', title: 'Default' },
          ],
        },
      ],
    );
  },
);

test('resolves an unqualified name only when it identifies one layer', () => {
  expect(readWmsLayerStyles(capabilities(), 'land')[0].styles).toHaveLength(2);
  const duplicate = layerXml.replace(
    '</Layer>',
    '</Layer><Layer><Name>other:land</Name><Title>Other</Title></Layer>',
  );
  expect(() =>
    readWmsLayerStyles(capabilities('1.3.0', duplicate), 'land'),
  ).toThrow('WMS layer not found');
});

test('keeps layers in request order, including numeric ArcGIS layer names', () => {
  const xml = capabilities(
    '1.3.0',
    layerXml.replace('<Name>roads</Name>', '<Name>0</Name>'),
  );
  expect(
    readWmsLayerStyles(xml, '0, workspace:land').map(layer => layer.name),
  ).toEqual(['0', 'workspace:land']);
});

test('deduplicates inherited styles and uses the name when the title is absent', () => {
  const xml = capabilities(
    '1.3.0',
    layerXml.replace(
      '<Style><Name>binary</Name><Title>Binary land use</Title></Style>',
      '<Style><Name>default</Name><Title>Local default</Title></Style><Style><Name>binary</Name></Style>',
    ),
  );
  expect(readWmsLayerStyles(xml, 'land')[0].styles).toEqual([
    { name: 'default', title: 'Local default' },
    { name: 'binary', title: 'binary' },
  ]);
});

test('allows layers without advertised styles', () => {
  const xml = capabilities(
    '1.3.0',
    '<Layer><Name>0</Name><Title>Raster</Title></Layer>',
  );
  expect(readWmsLayerStyles(xml, '0')).toEqual([{ name: '0', styles: [] }]);
});

test.each([
  '<html/>',
  '<ServiceExceptionReport/>',
  '<WMS_Capabilities>',
  capabilities('1.3.0', ''),
])('rejects invalid capabilities and WMS exceptions', xml => {
  expect(() => readWmsLayerStyles(xml, 'land')).toThrow(
    /Invalid WMS capabilities|Missing WMS layers/,
  );
});

test('rejects unknown layer names', () => {
  expect(() => readWmsLayerStyles(capabilities(), 'missing')).toThrow(
    'WMS layer not found',
  );
});

test('reuses successful capabilities responses for other layers on the same service', async () => {
  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(new Response(capabilities()));
  const { signal } = new AbortController();
  await getWmsLayerStyles(
    'https://cache.example.org/wms',
    '1.3.0',
    'land',
    signal,
  );
  await getWmsLayerStyles(
    'https://cache.example.org/wms',
    '1.3.0',
    'roads',
    signal,
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('REQUEST=GetCapabilities'),
    { signal },
  );
});

test('does not cache failed requests', async () => {
  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockResolvedValueOnce(new Response('', { status: 500 }))
    .mockResolvedValueOnce(new Response(capabilities()));
  const { signal } = new AbortController();
  await expect(
    getWmsLayerStyles('https://retry.example.org/wms', '1.3.0', 'land', signal),
  ).rejects.toThrow('Could not fetch WMS capabilities');
  await expect(
    getWmsLayerStyles('https://retry.example.org/wms', '1.3.0', 'land', signal),
  ).resolves.toHaveLength(1);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test.each(['1.3.0', '1.1.1'])(
  'lists named layers and excludes anonymous groups in WMS %s',
  version => {
    expect(
      readWmsAvailableLayers(capabilities(version)).map(({ name, title }) => ({
        name,
        title,
      })),
    ).toEqual([
      { name: 'workspace:land', title: 'Land' },
      { name: 'roads', title: 'Roads' },
    ]);
  },
);

test('keeps requestable groups and falls back to technical names for missing titles', () => {
  const xml = capabilities(
    '1.3.0',
    layerXml
      .replace('<Title>Root</Title>', '<Name>group</Name><Title>Root</Title>')
      .replace('<Title>Roads</Title>', ''),
  );
  expect(
    readWmsAvailableLayers(xml).map(({ name, title }) => ({ name, title })),
  ).toEqual([
    { name: 'group', title: 'Root' },
    { name: 'workspace:land', title: 'Land' },
    { name: 'roads', title: 'roads' },
  ]);
});

test('shares the cached response between layer discovery and style selection', async () => {
  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(new Response(capabilities()));
  const { signal } = new AbortController();
  expect(
    await getWmsAvailableLayers(
      'https://catalogue.example.org/wms',
      '1.3.0',
      signal,
    ),
  ).toHaveLength(2);
  expect(
    await getWmsLayerStyles(
      'https://catalogue.example.org/wms',
      '1.3.0',
      'land',
      signal,
    ),
  ).toHaveLength(1);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
