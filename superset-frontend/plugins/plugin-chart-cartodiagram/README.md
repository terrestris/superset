# plugin-chart-cartodiagram

An OpenLayers map that displays charts for single features. Superset Chart Plugin.

## Usage

To build the plugin, run the following commands:

```
npm ci
npm run build
```

Alternatively, to run the plugin in development mode (=rebuilding whenever changes are made), start the dev server with the following command:

```
npm run dev
```

To add the package to Superset, go to the `superset-frontend` subdirectory in your Superset source folder (assuming both the `superset-ol-plugin` plugin and `superset` repos are in the same root directory) and run
```
npm i -S ../../superset-ol-plugin
```

After this edit the `superset-frontend/src/visualizations/presets/MainPreset.js` and make the following changes:

```js
import { SupersetOlPlugin } from 'superset-ol-plugin';
```

to import the plugin and later add the following to the array that's passed to the `plugins` property:
```js
new SupersetOlPlugin().configure({ key: 'superset-ol-plugin' }),
```

After that the plugin should show up when you run Superset, e.g. the development server:

```
npm run dev-server
```

## Releases

Releases will be created and published automatically.

In order to publish a proper release, follow these steps:

1. Run `npm version patch|minor|major -m "Version %s"`
2. Run `git push origin master && git push --tags`
3. Watch pipeline doing its job
