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
import { useState } from 'react';
import { ControlHeader } from '@superset-ui/chart-controls';
import { useTheme } from '@apache-superset/core/theme';
import { Form, Input, InputNumber, Select } from '@superset-ui/core/components';

type ControlFormItemProps = {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  className?: string;
  warning?: string;
} & (
  | {
      controlType: 'Input' | 'Select' | 'LayerSelect';
      value?: string;
      defaultValue?: string;
      options?: { value: string; label: string }[];
      onChange: (value: string) => void;
    }
  | {
      controlType: 'InputNumber';
      value?: number;
      onChange: (value: number) => void;
    }
);

/** Layer fields use the same controls and spacing as the shared layer editor. */
export default function ControlFormItem(props: ControlFormItemProps) {
  const { sizeUnit } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      css={{ margin: 2 * sizeUnit, maxWidth: '100%', flex: 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ControlHeader
        name={props.name}
        label={props.label}
        description={props.description}
        hovered={hovered}
      />
      <Form.Item
        help={props.warning}
        validateStatus={props.warning ? 'warning' : undefined}
        style={{ marginBottom: 0 }}
      >
        {props.controlType === 'InputNumber' ? (
          <InputNumber
            id={props.name}
            className={props.className}
            placeholder={props.placeholder}
            value={props.value}
            onChange={value => {
              if (typeof value === 'number') props.onChange(value);
            }}
          />
        ) : props.controlType === 'LayerSelect' ? (
          <Select
            aria-label={props.label}
            className={props.className}
            mode="single"
            showSearch
            allowClear
            placeholder={props.placeholder}
            value={props.value || undefined}
            options={props.options ?? []}
            onChange={value =>
              props.onChange(value == null ? '' : String(value))
            }
          />
        ) : props.controlType === 'Select' ? (
          <Select
            aria-label={props.label}
            className={props.className}
            value={props.value ?? props.defaultValue}
            options={props.options ?? []}
            onChange={value => props.onChange(String(value))}
          />
        ) : (
          <Input
            id={props.name}
            className={props.className}
            placeholder={props.placeholder}
            value={props.value ?? ''}
            onChange={event => props.onChange(event.target.value)}
          />
        )}
      </Form.Item>
    </div>
  );
}
