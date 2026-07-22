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
import { SelectOutlined } from '@ant-design/icons';
import { t } from '@apache-superset/core/translation';
import { CSSProperties } from 'react';

export interface LassoControlProps {
  /** Whether lasso mode is currently active (waiting for the user to draw). */
  active: boolean;
  /** When true the button is visible but non-interactive (cross-filters disabled). */
  disabled?: boolean;
  /** Called when the toggle button is clicked. */
  onToggle: () => void;
}

export const btnBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '1px',
  padding: '0',
  fontWeight: 'bold',
  fontSize: 'inherit',
  height: '1.375em',
  width: '1.375em',
  backgroundColor: 'var(--ol-background-color)',
  color: 'var(--ol-subtle-foreground-color)',
  border: 'none',
  borderRadius: '2px',
  cursor: 'pointer',
};

export const activeBtnStyle: CSSProperties = {
  ...btnBaseStyle,
  color: 'var(--ol-foreground-color)',
  backgroundColor: 'var(--ol-subtle-background-color)',
  outline: '1px solid var(--ol-subtle-foreground-color)',
  outlineOffset: '-1px',
};

const disabledBtnStyle: CSSProperties = {
  ...btnBaseStyle,
  cursor: 'default',
};

/**
 * A toggle button for entering / exiting lasso drawing mode.
 */
export const LassoControl = ({
  active,
  disabled,
  onToggle,
}: LassoControlProps) => {
  // eslint-disable-next-line no-nested-ternary
  const style = disabled
    ? disabledBtnStyle
    : active
      ? activeBtnStyle
      : btnBaseStyle;
  return (
    <button
      type="button"
      className="lasso-toggle-btn"
      style={style}
      title={active ? t('Cancel lasso selection') : t('Lasso selection')}
      disabled={disabled}
      onClick={onToggle}
    >
      <SelectOutlined />
    </button>
  );
};

export default LassoControl;
