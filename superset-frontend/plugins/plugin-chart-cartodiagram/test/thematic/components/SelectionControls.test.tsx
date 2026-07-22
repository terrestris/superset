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

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Map from 'ol/Map';
import { SelectionControls } from '../../../src/thematic/components/SelectionControls';

jest.mock('ol/Map', () =>
  jest.fn().mockImplementation(() => ({
    addControl: jest.fn(),
    removeControl: jest.fn(),
  })),
);

jest.mock('ol/control/Control.js', () =>
  jest.fn().mockImplementation(() => ({})),
);

const olMap = new Map();

const defaultProps = {
  olMap,
  active: false,
  hasSelection: false,
  onToggle: jest.fn(),
  onClear: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('lasso button is not disabled by default', () => {
  render(<SelectionControls {...defaultProps} />);
  expect(screen.getByTitle('Lasso selection')).not.toBeDisabled();
});

test('lasso button is disabled when disabled prop is true', () => {
  render(<SelectionControls {...defaultProps} disabled />);
  expect(screen.getByTitle('Lasso selection')).toBeDisabled();
});

test('clear button is not shown when there is no selection and lasso is inactive', () => {
  render(<SelectionControls {...defaultProps} />);
  expect(screen.queryByTitle('Clear selection')).not.toBeInTheDocument();
});

test('clear button is shown when a selection is active', () => {
  render(<SelectionControls {...defaultProps} hasSelection />);
  expect(screen.getByTitle('Clear selection')).toBeInTheDocument();
});

test('clear button is shown when lasso mode is active', () => {
  render(<SelectionControls {...defaultProps} active />);
  expect(screen.getByTitle('Clear selection')).toBeInTheDocument();
});
