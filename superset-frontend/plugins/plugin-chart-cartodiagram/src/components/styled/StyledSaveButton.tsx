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

import { css, styled } from '@superset-ui/core';
import { Button } from 'antd';

export const StyledSaveButton = styled(Button)`
  ${({ theme }) => css`
    flex: 1;
    margin-left: 4px;
    line-height: 1.5715;
    border-radius: ${theme.borderRadius}px;
    background-color: ${theme.colors.primary.base};
    color: ${theme.colors.grayscale.light5};
    font-size: ${theme.typography.sizes.s}px;
    font-weight: ${theme.typography.weights.bold};
    text-transform: uppercase;
    min-width: ${theme.gridUnit * 36};
    min-height: ${theme.gridUnit * 8};
    box-shadow: none;
    border-width: 0px;
    border-style: none;
    border-color: transparent;
    &:hover {
      background-color: ${theme.colors.primary.dark1};
    }
  `}
`;

export default StyledSaveButton;
