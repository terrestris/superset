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
import { CloseOutlined } from '@ant-design/icons';
import { t } from '@apache-superset/core/translation';
import { btnBaseStyle } from './LassoControl';

export interface ClearSelectionControlProps {
  /** Called when the clear button is clicked. */
  onClear: () => void;
}

/**
 * A button that clears the current cross-filter selection, regardless of
 * whether it was created via lasso drawing or single-click.
 */
export const ClearSelectionControl = ({
  onClear,
}: ClearSelectionControlProps) => (
  <button
    type="button"
    className="clear-selection-btn"
    style={btnBaseStyle}
    title={t('Clear selection')}
    onClick={onClear}
  >
    <CloseOutlined />
  </button>
);

export default ClearSelectionControl;
