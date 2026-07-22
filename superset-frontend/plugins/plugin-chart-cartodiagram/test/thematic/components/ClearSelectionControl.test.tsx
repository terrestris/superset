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
import { ClearSelectionControl } from '../../../src/thematic/components/ClearSelectionControl';

test('renders the clear button', () => {
  render(<ClearSelectionControl onClear={jest.fn()} />);
  expect(screen.getByTitle('Clear selection')).toBeInTheDocument();
});

test('calls onClear when clicked', () => {
  const onClear = jest.fn();
  render(<ClearSelectionControl onClear={onClear} />);
  userEvent.click(screen.getByTitle('Clear selection'));
  expect(onClear).toHaveBeenCalledTimes(1);
});
