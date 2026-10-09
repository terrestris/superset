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
// The host application's test harness supplies Superset providers.
// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen, waitFor } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import LayerConfigsPopoverContent from '../../src/components/LayerConfigsControl/LayerConfigsPopoverContent';
import { WmsLayerConf } from '../../src/types';
import { getWmsAvailableLayers } from '../../src/util/wmsCapabilitiesUtil';

jest.mock('geostyler-wfs-parser', () => jest.fn());
jest.mock('geostyler-sld-parser', () => jest.fn());
jest.mock('geostyler', () => ({
  GeoStylerContext: jest.requireActual('react').createContext({}),
  CardStyle: () => <div>Vector style editor</div>,
  locale: { en_US: {} },
}));
jest.mock('../../src/util/wmsCapabilitiesUtil', () => ({
  ...jest.requireActual('../../src/util/wmsCapabilitiesUtil'),
  getWmsAvailableLayers: jest.fn(),
}));
const getLayers = jest.mocked(getWmsAvailableLayers);
const layer: WmsLayerConf = {
  id: 'land-id',
  type: 'WMS',
  title: 'Land',
  url: 'https://example.org/wms',
  version: '1.3.0',
  layersParam: 'land',
};
const styles = [
  { name: 'binary', title: 'Binary' },
  { name: 'enaf', title: 'ENAF' },
];

beforeEach(() => {
  jest.clearAllMocks();
  getLayers.mockResolvedValue([
    { name: 'land', title: 'Land use', styles },
    { name: 'roads', title: 'Road network', styles },
  ]);
});

test('keeps Style disabled before selecting a layer', () => {
  render(
    <LayerConfigsPopoverContent
      layerConf={{ ...layer, layersParam: '' }}
      enableDataLayer={false}
    />,
  );
  expect(screen.getByRole('tab', { name: 'Style' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  expect(getLayers).not.toHaveBeenCalled();
});

test('discovers styles before opening Style and saves the selection', async () => {
  const onSave = jest.fn();
  render(
    <LayerConfigsPopoverContent
      layerConf={layer}
      enableDataLayer={false}
      onSave={onSave}
    />,
  );
  const tab = screen.getByRole('tab', { name: 'Style' });
  await waitFor(() => expect(tab).not.toHaveAttribute('aria-disabled', 'true'));
  userEvent.click(tab);
  userEvent.click(screen.getByRole('combobox', { name: 'WMS style for land' }));
  userEvent.click(await screen.findByText('Binary'));
  userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ ...layer, stylesParam: 'binary' }),
  );
  expect(screen.queryByText('Vector style editor')).not.toBeInTheDocument();
});

test('preserves a saved WMS style when editing the title before discovery completes', () => {
  const onSave = jest.fn();
  render(
    <LayerConfigsPopoverContent
      layerConf={{ ...layer, stylesParam: 'binary' }}
      enableDataLayer={false}
      onSave={onSave}
    />,
  );
  const title = screen.getByDisplayValue('Land');
  userEvent.clear(title);
  userEvent.type(title, 'Updated');
  userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Updated', stylesParam: 'binary' }),
  );
});

test('keeps Style disabled when the service advertises a single style', async () => {
  getLayers.mockResolvedValue([
    { name: 'land', title: 'Land use', styles: [styles[0]] },
  ]);
  render(
    <LayerConfigsPopoverContent layerConf={layer} enableDataLayer={false} />,
  );
  await waitFor(() => expect(getLayers).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('tab', { name: 'Style' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

test.each(['WFS', 'DATA'] as const)('retains GeoStyler for %s layers', type => {
  render(
    <LayerConfigsPopoverContent
      layerConf={
        type === 'WFS'
          ? { type, title: 'Features', url: '', typeName: '', version: '2.0.0' }
          : { type, title: 'Data' }
      }
      enableDataLayer
    />,
  );
  userEvent.click(screen.getByRole('tab', { name: 'Style' }));
  expect(screen.getByText('Vector style editor')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /Import SLD/ }),
  ).toBeInTheDocument();
  expect(getLayers).not.toHaveBeenCalled();
});

test('keeps XYZ configuration available without a style editor', () => {
  const onSave = jest.fn();
  render(
    <LayerConfigsPopoverContent
      layerConf={{
        type: 'XYZ',
        title: 'Tiles',
        url: 'https://example.org/{z}/{x}/{y}',
      }}
      enableDataLayer={false}
      onSave={onSave}
    />,
  );
  userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'XYZ',
      url: 'https://example.org/{z}/{x}/{y}',
    }),
  );
  expect(screen.getByRole('tab', { name: 'Style' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

test('disables Style when switching from a WMS with styles to XYZ', async () => {
  render(
    <LayerConfigsPopoverContent layerConf={layer} enableDataLayer={false} />,
  );
  const styleTab = screen.getByRole('tab', { name: 'Style' });
  await waitFor(() =>
    expect(styleTab).not.toHaveAttribute('aria-disabled', 'true'),
  );
  userEvent.click(screen.getByRole('combobox', { name: 'Layer type' }));
  userEvent.click(await screen.findByText('XYZ'));
  expect(styleTab).toHaveAttribute('aria-disabled', 'true');
  expect(screen.queryByLabelText('Layer Name')).not.toBeInTheDocument();
});

test('warns in Layer and keeps Style disabled after a capabilities failure', async () => {
  getLayers.mockRejectedValue(new Error('Network error'));
  const onSave = jest.fn();
  render(
    <LayerConfigsPopoverContent
      layerConf={{ ...layer, stylesParam: 'binary' }}
      enableDataLayer={false}
      onSave={onSave}
    />,
  );
  expect(
    await screen.findByText('Could not load WMS GetCapabilities'),
  ).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Layer' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('tab', { name: 'Style' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ stylesParam: 'binary' }),
  );
});

test('clears the capabilities warning after changing to a working service', async () => {
  getLayers.mockRejectedValueOnce(new Error('Network error'));
  render(
    <LayerConfigsPopoverContent layerConf={layer} enableDataLayer={false} />,
  );
  await screen.findByText('Could not load WMS GetCapabilities');
  userEvent.type(screen.getByLabelText('Layer URL'), '/other');
  await waitFor(() =>
    expect(screen.getByRole('tab', { name: 'Style' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    ),
  );
  expect(
    screen.queryByText('Could not load WMS GetCapabilities'),
  ).not.toBeInTheDocument();
});

test('discovers and selects a layer without an initial layer name', async () => {
  const onSave = jest.fn();
  render(
    <LayerConfigsPopoverContent
      layerConf={{ ...layer, layersParam: '' }}
      enableDataLayer={false}
      onSave={onSave}
    />,
  );
  const selector = await screen.findByRole('combobox', { name: 'Layer Name' });
  expect(getLayers).toHaveBeenCalledWith(
    layer.url,
    layer.version,
    expect.any(AbortSignal),
  );
  userEvent.type(selector, 'Road');
  userEvent.click(await screen.findByText('Road network (roads)'));
  userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ layersParam: 'roads' }),
  );
  expect(getLayers).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('tab', { name: 'Style' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

test('replaces the selected layer instead of adding a second layer', async () => {
  const onSave = jest.fn();
  render(
    <LayerConfigsPopoverContent
      layerConf={{ ...layer, layersParam: '' }}
      enableDataLayer={false}
      onSave={onSave}
    />,
  );
  const selector = await screen.findByRole('combobox', { name: 'Layer Name' });
  userEvent.click(selector);
  userEvent.click(await screen.findByText('Road network (roads)'));
  userEvent.click(selector);
  userEvent.click(await screen.findByText('Land use (land)'));
  userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ layersParam: 'land' }),
  );
  expect(getLayers).toHaveBeenCalledTimes(1);
});

test('preserves an existing multi-layer request when editing only the title', async () => {
  const onSave = jest.fn();
  render(
    <LayerConfigsPopoverContent
      layerConf={{
        ...layer,
        layersParam: 'roads,land',
        stylesParam: ',binary',
      }}
      enableDataLayer={false}
      onSave={onSave}
    />,
  );
  await screen.findByRole('combobox', { name: 'Layer Name' });
  userEvent.type(screen.getByLabelText('Layer title'), ' updated');
  userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      layersParam: 'roads,land',
      stylesParam: ',binary',
    }),
  );
});

test('keeps manual layer name entry when capabilities are unavailable', async () => {
  getLayers.mockRejectedValue(new Error('Network error'));
  const onSave = jest.fn();
  render(
    <LayerConfigsPopoverContent
      layerConf={{ ...layer, layersParam: '' }}
      enableDataLayer={false}
      onSave={onSave}
    />,
  );
  await screen.findByText('Could not load WMS GetCapabilities');
  userEvent.type(screen.getByLabelText('Layer Name'), 'manual_layer');
  userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ layersParam: 'manual_layer' }),
  );
  expect(screen.getByRole('tab', { name: 'Style' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  expect(getLayers).toHaveBeenCalledTimes(1);
});

test('ignores an old catalogue after changing the WMS service', async () => {
  let resolveOldRequest: (
    layers: { name: string; title: string; styles: typeof styles }[],
  ) => void = () => {};
  getLayers.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        resolveOldRequest = resolve;
      }),
  );
  getLayers.mockResolvedValue([{ name: 'roads', title: 'New roads', styles }]);
  render(
    <LayerConfigsPopoverContent
      layerConf={{ ...layer, layersParam: '' }}
      enableDataLayer={false}
    />,
  );
  await waitFor(() => expect(getLayers).toHaveBeenCalledTimes(1));
  const [[, , signal]] = getLayers.mock.calls;
  userEvent.type(screen.getByLabelText('Layer URL'), '/new');
  expect(signal.aborted).toBe(true);
  const selector = await screen.findByRole('combobox', { name: 'Layer Name' });
  resolveOldRequest([{ name: 'land', title: 'Old land', styles }]);
  userEvent.click(selector);
  expect(await screen.findByText('New roads (roads)')).toBeInTheDocument();
  expect(screen.queryByText('Old land (land)')).not.toBeInTheDocument();
});

test('retains an existing layer and style that are absent from the catalogue', async () => {
  const onSave = jest.fn();
  render(
    <LayerConfigsPopoverContent
      layerConf={{ ...layer, layersParam: 'legacy', stylesParam: 'old_style' }}
      enableDataLayer={false}
      onSave={onSave}
    />,
  );
  await screen.findByRole('combobox', { name: 'Layer Name' });
  expect(screen.getByText('legacy')).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      layersParam: 'legacy',
      stylesParam: 'old_style',
    }),
  );
});
