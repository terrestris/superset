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
import { WmsStyleEditor } from '../../src/components/WmsStyleEditor';
import { WmsLayerConf } from '../../src/types';
import { getWmsLayerStyles } from '../../src/util/wmsCapabilitiesUtil';

jest.mock('../../src/util/wmsCapabilitiesUtil', () => ({
  getWmsLayerStyles: jest.fn(),
}));
const getStyles = jest.mocked(getWmsLayerStyles);
const layer: WmsLayerConf = {
  type: 'WMS',
  title: 'Land use',
  url: 'https://example.org/wms',
  version: '1.3.0',
  layersParam: 'land',
};
const styles = [
  {
    name: 'land',
    styles: [
      { name: 'binary', title: 'Binary' },
      { name: 'enaf', title: 'ENAF' },
    ],
  },
];
const onChange = jest.fn();
const onAvailabilityChange = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  getStyles.mockResolvedValue(styles);
});

test('waits for both the URL and layer name before requesting capabilities', () => {
  render(
    <WmsStyleEditor
      layerConf={{ ...layer, layersParam: '' }}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
    />,
  );
  expect(getStyles).not.toHaveBeenCalled();
  expect(onAvailabilityChange).toHaveBeenLastCalledWith(false);
});

test('enables style selection when several styles are advertised and saves the name', async () => {
  render(
    <WmsStyleEditor
      layerConf={layer}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
    />,
  );
  await waitFor(() =>
    expect(onAvailabilityChange).toHaveBeenLastCalledWith(true),
  );
  userEvent.click(screen.getByRole('combobox'));
  userEvent.click(await screen.findByText('Binary'));
  expect(onChange).toHaveBeenCalledWith({ stylesParam: 'binary' });
});

test('keeps the Style tab disabled when only one style is available', async () => {
  getStyles.mockResolvedValue([
    { name: 'land', styles: [styles[0].styles[0]] },
  ]);
  render(
    <WmsStyleEditor
      layerConf={layer}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
    />,
  );
  await screen.findByRole('combobox');
  expect(onAvailabilityChange).toHaveBeenLastCalledWith(false);
});

test('keeps Style disabled and reports an error when capabilities cannot be read', async () => {
  const onErrorChange = jest.fn();
  getStyles.mockRejectedValue(new Error('Network error'));
  render(
    <WmsStyleEditor
      layerConf={{ ...layer, stylesParam: 'binary' }}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
      onErrorChange={onErrorChange}
    />,
  );
  await waitFor(() => expect(onErrorChange).toHaveBeenLastCalledWith(true));
  expect(onAvailabilityChange).toHaveBeenLastCalledWith(false);
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
});

test('preserves style positions when several layers are requested', async () => {
  getStyles.mockResolvedValue([...styles, { ...styles[0], name: 'roads' }]);
  render(
    <WmsStyleEditor
      layerConf={{ ...layer, layersParam: 'land,roads' }}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
    />,
  );
  await waitFor(() => expect(screen.getAllByRole('combobox')).toHaveLength(2));
  userEvent.click(screen.getAllByRole('combobox')[1]);
  userEvent.click(await screen.findByText('Binary'));
  expect(onChange).toHaveBeenCalledWith({ stylesParam: ',binary' });
});

test('aborts requests and resets the selected style when the service changes', async () => {
  const { rerender } = render(
    <WmsStyleEditor
      layerConf={{ ...layer, stylesParam: 'binary' }}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
    />,
  );
  await waitFor(() => expect(getStyles).toHaveBeenCalledTimes(1));
  const [, , , signal] = getStyles.mock.calls[0];
  rerender(
    <WmsStyleEditor
      layerConf={{ ...layer, url: 'https://other.example.org/wms' }}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
    />,
  );
  expect(signal.aborted).toBe(true);
  expect(onChange).toHaveBeenCalledWith({ stylesParam: '' });
});

test('retains a saved style that is no longer advertised', async () => {
  render(
    <WmsStyleEditor
      layerConf={{ ...layer, stylesParam: 'legacy' }}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
    />,
  );
  await waitFor(() =>
    expect(onAvailabilityChange).toHaveBeenLastCalledWith(true),
  );
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByText('legacy')).toBeInTheDocument();
});

test('returns to the server default when its option is selected', async () => {
  render(
    <WmsStyleEditor
      layerConf={{ ...layer, stylesParam: 'binary' }}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
    />,
  );
  await screen.findByRole('combobox');
  userEvent.click(screen.getByRole('combobox'));
  userEvent.click(await screen.findByText('Server default'));
  expect(onChange).toHaveBeenCalledWith({ stylesParam: '' });
});

test('ignores a response that arrives after switching to another service', async () => {
  let resolveRequest: (value: typeof styles) => void = () => {};
  getStyles.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        resolveRequest = resolve;
      }),
  );
  const { rerender } = render(
    <WmsStyleEditor
      layerConf={layer}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
    />,
  );
  await waitFor(() => expect(getStyles).toHaveBeenCalledTimes(1));
  rerender(
    <WmsStyleEditor
      layerConf={{ ...layer, url: '' }}
      onChange={onChange}
      onAvailabilityChange={onAvailabilityChange}
    />,
  );
  resolveRequest(styles);
  await waitFor(() =>
    expect(onAvailabilityChange).toHaveBeenLastCalledWith(false),
  );
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
});
