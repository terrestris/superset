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
import { CSSProperties, useEffect, useRef } from 'react';
import Control from 'ol/control/Control.js';
import Map from 'ol/Map';
import { LassoControl } from './LassoControl';
import { ClearSelectionControl } from './ClearSelectionControl';

export interface SelectionControlsProps {
  olMap: Map;
  /** Whether lasso mode is currently active (waiting for the user to draw). */
  active: boolean;
  /** When true the lasso button is visible but non-interactive (cross-filters disabled). */
  disabled?: boolean;
  /** Whether a selection (from lasso or click) is currently active. */
  hasSelection: boolean;
  /** Called when the lasso toggle button is clicked. */
  onToggle: () => void;
  /** Called when the clear button is clicked. */
  onClear: () => void;
}

const controlStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  top: '0.5em',
  right: '0.5em',
  backgroundColor: 'transparent',
  padding: 0,
};

/**
 * An OpenLayers control that groups the lasso toggle button and the clear
 * selection button in a shared flex-column container. Using a single OL
 * control for both buttons means their stacking is handled by flexbox rather
 * than fragile CSS offset calculations. The clear button is shown whenever a
 * selection exists (from lasso or single-click) or while lasso drawing mode is
 * active.
 */
export const SelectionControls = ({
  olMap,
  active,
  disabled,
  hasSelection,
  onToggle,
  onClear,
}: SelectionControlsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const control = new Control({ element: containerRef.current });
    olMap.addControl(control);

    return () => {
      olMap.removeControl(control);
    };
  }, [olMap]);

  const showClearButton = active || hasSelection;

  return (
    <div>
      <div
        ref={containerRef}
        className="selection-controls ol-unselectable ol-control"
        style={controlStyle}
      >
        <LassoControl active={active} disabled={disabled} onToggle={onToggle} />
        {showClearButton && <ClearSelectionControl onClear={onClear} />}
      </div>
    </div>
  );
};

export default SelectionControls;
