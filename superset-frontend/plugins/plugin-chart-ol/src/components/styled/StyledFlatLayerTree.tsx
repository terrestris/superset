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
import FlatLayerTree from '../controls/LayerConfigsControl/FlatLayerTree';

export const StyledFlatLayerTree = styled(FlatLayerTree)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;

    border: solid;
    border-width: 1px;
    border-radius: ${theme.borderRadius}px;
    border-color: ${theme.colors.grayscale.light2};

    & .add-layer-btn {
      display: flex;
      align-items: center;

      margin: 4px;

      color: ${theme.colors.grayscale.light1};
      font-size: ${theme.typography.sizes.s}px;
      font-weight: ${theme.typography.weights.normal};

      &:hover {
        background-color: ${theme.colors.grayscale.light4};
        border-color: ${theme.colors.grayscale.light2};
      }
    }

    & .ant-tree .ant-tree-treenode {
      display: block;
    }

    & .ant-tree-list-holder-inner {
      display: block !important;
    }

    & .ant-tree-node-content-wrapper {
      display: block;
    }

    & .ant-tree-node-content-wrapper:hover {
      background-color: unset;
    }
  `}
`;

export default StyledFlatLayerTree;
