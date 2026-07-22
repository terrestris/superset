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
import userEvent from '@testing-library/user-event';
import { LassoControl } from '../../../src/thematic/components/LassoControl';

const defaultProps = {
  active: false,
  onToggle: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders the toggle button', () => {
  render(<LassoControl {...defaultProps} />);
  expect(screen.getByTitle('Lasso selection')).toBeInTheDocument();
});

test('toggle button title reflects active state', () => {
  render(<LassoControl {...defaultProps} active />);
  expect(screen.getByTitle('Cancel lasso selection')).toBeInTheDocument();
});

test('calls onToggle when the toggle button is clicked', () => {
  render(<LassoControl {...defaultProps} />);
  userEvent.click(screen.getByTitle('Lasso selection'));
  expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
});

test('button is disabled when disabled prop is true', () => {
  render(<LassoControl {...defaultProps} disabled />);
  expect(screen.getByTitle('Lasso selection')).toBeDisabled();
});

test('does not call onToggle when disabled', () => {
  render(<LassoControl {...defaultProps} disabled />);
  userEvent.click(screen.getByTitle('Lasso selection'));
  expect(defaultProps.onToggle).not.toHaveBeenCalled();
});
