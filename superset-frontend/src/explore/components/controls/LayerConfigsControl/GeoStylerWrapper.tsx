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

/**
 * This component is needed to be able to style GeoStyler
 * via emotion. Emotion can only be used on a component that
 * accepts a className property.
 */
import { CardStyle } from 'geostyler/dist/Component/CardStyle/CardStyle';
import { FC } from 'react';
import { ConfigProvider } from 'antd-v5';
import { GeoStylerWrapperProps } from './types';

export const GeoStylerWrapper: FC<GeoStylerWrapperProps> = ({
  className,
  ...passThroughProps
}) => (
  <div className={className}>
    {/*
     We reset to the default class prefix since geostyler css relies on
     the default antd prefix. This can probably be removed once
     antd v4 is no longer supported and the prefix antd5 is not being
     used anymore.
    */}
    <ConfigProvider prefixCls="ant">
      <CardStyle {...passThroughProps} />
    </ConfigProvider>
  </div>
);

export default GeoStylerWrapper;
