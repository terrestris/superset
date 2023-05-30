<!--
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
-->

## @superset-ui/plugin-chart-cartodiagram

[![Version](https://img.shields.io/npm/v/@superset-ui/plugin-chart-cartodiagram.svg?style=flat-square)](https://www.npmjs.com/package/@superset-ui/plugin-chart-cartodiagram)

This plugin allows rendering arbitrary charts on an OpnLayers map.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import {
  CartodiagramPlugin,
} from '@superset-ui/plugin-chart-cartodiagram';

new CartodiagramPlugin().configure({ key: 'cartodiagram' }).register();
```

Default layers can be added to the constructor. These layers will be added to each chart by default. See also `./src/types.ts` for the definitions of types `WmsLayerConf`, `WfsLayerConf` and `XyzLayerConf`.

```js
import {
  CartodiagramPlugin,
} from '@superset-ui/plugin-chart-cartodiagram';

const opts = {
  defaultLayers: [
    {
      type: 'XYZ',
      url: 'example.com/path/to/xyz/layer',
      title: 'my default layer title',
      attribution: 'my default layer attribution',
    },
  ],
};

new CartodiagramPlugin(opts).configure({ key: 'cartodiagram' }).register();
```

This plugin expects a dataset to provide a column containing a GeoJSON point geometry. This column will be used for positioning the
charts on the map.

To create a cartodiagram, first create and save a chart of the type you want to render on the map (e.g. pieChart).
This chart should not be grouped by location.

Afterwards, create a cartodiagram, using the same dataset as the previously created chart. Then, select the previously created chart from the
dropdown and specify the column name that contains the GeoJSON point geometries.
