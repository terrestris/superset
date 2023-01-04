import Layer from 'ol/layer/Layer';
import { FrameState } from 'ol/Map';
import { apply as applyTransform } from 'ol/transform';
import ReactDOM from 'react-dom';
import {
  ChartConfig,
  ChartLayerOptions,
  ChartSizeValues,
  ChartsPerZoom,
  SupportedVizTypes,
} from '../types';
import { createChartComponent } from '../util/chartUtil';
import { getCoordinateFromLocation } from '../util/geometryUtil';

/**
 * Custom OpenLayers layer that displays a number of charts
 * provided as HTML elements.
 */
export class ChartLayer extends Layer {
  chartsPerZoom: ChartsPerZoom = {};

  chartConfigs: ChartConfig = {};

  chartSizeValues: ChartSizeValues = {};

  chartVizType: SupportedVizTypes;

  div: HTMLDivElement;

  chartBackgroundCssColor = '';

  chartBackgroundBorderRadius = 0;

  prerenderedZoomLevels: number[] = [];

  /**
   * Create a ChartLayer.
   *
   * @param {ChartLayerOptions} options The options to create a ChartLayer
   * @param {ChartHtmlElement[]} options.charts An array with the chart objects containing the HTML element and the coordinate
   * @param {ChartsPerZoom} options.chartsPerZoom Set of prerendered charts per zoom level
   * @param {ChartConfig} options.chartConfigs The chart configuration for the charts
   * @param {ChartSizeValues} options.chartSizeValues The values for the chart sizes
   * @param {SupportedVizTypes} options.chartVizType The viztype of the charts
   * @param {String} options.chartBackgroundCssColor The color of the additionally added chart background
   * @param {Number} options.chartBackgroundBorderRadius The border radius in percent of the additionally added chart background
   * @param {Number[]} options.prerenderedZoomLevels The zoom levels that should be prerendered
   * @param {Function} options.onMouseOver The handler function to execute when the mouse entering a HTML element
   * @param {Function} options.onMouseOut The handler function to execute when the mouse leaves a HTML element
   */
  constructor(options: ChartLayerOptions) {
    super(options);

    this.chartVizType = options.chartVizType;

    if (options.chartConfigs) {
      this.chartConfigs = options.chartConfigs;
    }

    if (options.chartsPerZoom) {
      this.chartsPerZoom = options.chartsPerZoom;
    }

    if (options.chartSizeValues) {
      this.chartSizeValues = options.chartSizeValues;
    }

    if (options.chartBackgroundCssColor) {
      this.chartBackgroundCssColor = options.chartBackgroundCssColor;
    }

    if (options.chartBackgroundBorderRadius) {
      this.chartBackgroundBorderRadius = options.chartBackgroundBorderRadius;
    }

    if (options.prerenderedZoomLevels) {
      this.prerenderedZoomLevels = options.prerenderedZoomLevels;
    }

    this.div = document.createElement('div');

    // TODO: consider creating an OpenLayers event
    if (options.onMouseOver) {
      this.div.onmouseover = options.onMouseOver;
    }

    // TODO: consider creating an OpenLayers event
    if (options.onMouseOut) {
      this.div.onmouseout = options.onMouseOut;
    }
  }

  setChartConfig(chartConfigs: ChartConfig, silent = false) {
    this.chartConfigs = chartConfigs;
    if (!silent) {
      this.invalidateCache();
      this.changed();
    }
  }

  setChartVizType(chartVizType: SupportedVizTypes, silent = false) {
    this.chartVizType = chartVizType;
    if (!silent) {
      this.invalidateCache();
      this.changed();
    }
  }

  setChartsPerZoom(chartsPerZoom: ChartsPerZoom, silent = false) {
    this.chartsPerZoom = chartsPerZoom;
    if (!silent) {
      this.invalidateCache();
      this.changed();
    }
  }

  /**
   * Get all charts mapped by zoom level.
   * @returns The charts.
   */
  getChartsPerZoom() {
    return this.chartsPerZoom;
  }

  setChartSizeValues(chartSizeValues: ChartSizeValues, silent = false) {
    this.chartSizeValues = chartSizeValues;
    if (!silent) {
      this.invalidateCache();
      this.changed();
    }
  }

  setChartBackgroundCssColor(chartBackgroundCssColor: string, silent = false) {
    this.chartBackgroundCssColor = chartBackgroundCssColor;
    if (!silent) {
      this.changed();
    }
  }

  setChartBackgroundBorderRadius(
    chartBackgroundBorderRadius: number,
    silent = false,
  ) {
    this.chartBackgroundBorderRadius = chartBackgroundBorderRadius;
    if (!silent) {
      this.changed();
    }
  }

  setPrerenderedZoomLevels(prerenderedZoomLevels: number[], silent = false) {
    this.prerenderedZoomLevels = prerenderedZoomLevels;
    if (!silent) {
      this.invalidateCache();
      this.changed();
    }
  }

  /**
   * Unmount and remove all created chart elements from the DOM.
   */
  removeAllChartElements() {
    const chartsPerZoom = this.getChartsPerZoom();
    Object.keys(chartsPerZoom)
      .map(k => parseInt(k, 10))
      .forEach(k => {
        chartsPerZoom[k].forEach(chart => {
          const { htmlElement } = chart;
          ReactDOM.unmountComponentAtNode(htmlElement);
          htmlElement.remove();
        });
      });
  }

  /**
   * Invalidate the cache and repopulate it
   * with prerenderedZoomLevels.
   */
  invalidateCache() {
    this.chartsPerZoom = {};
    this.prerenderedZoomLevels.forEach(zoom => {
      this.createChartsPerZoom(zoom);
    }, this);
  }

  /**
   * Create all charts for given zoom level.
   * @param zoom The zoom level.
   */
  createChartsPerZoom(zoom: number) {
    const locations = Object.keys(this.chartConfigs);
    const charts = locations.map(loc => {
      const container = document.createElement('div');

      let chartWidth = 0;
      let chartHeight = 0;
      if (this.chartSizeValues[zoom]) {
        chartWidth = this.chartSizeValues[zoom].width;
        chartHeight = this.chartSizeValues[zoom].height;
      }

      // add location to container
      const chartComponent = createChartComponent(
        loc,
        this.chartVizType,
        this.chartConfigs,
        chartWidth,
        chartHeight,
      );
      ReactDOM.render(chartComponent, container);

      return {
        htmlElement: container,
        coordinate: getCoordinateFromLocation(loc),
        width: chartWidth,
        height: chartHeight,
      };
    });

    this.chartsPerZoom[zoom] = charts;
  }

  render(frameState: FrameState | null) {
    if (!frameState) {
      return this.div;
    }

    const { viewState } = frameState;
    const currentZoom = Math.round(viewState.zoom);

    let charts = this.chartsPerZoom[currentZoom];
    // only create charts if they do not exist yet
    if (!charts) {
      this.createChartsPerZoom(currentZoom);
      charts = this.chartsPerZoom[currentZoom];
    }

    charts.forEach(chartObject => {
      const { htmlElement, coordinate, width, height } = chartObject;

      // clone, because applyTransform modifies in place
      const coordCopy = [...coordinate];

      const [x, y] = applyTransform(
        frameState.coordinateToPixelTransform,
        coordCopy,
      );

      // left and top are corrected to place the center of the chart to its location
      htmlElement.style.left = `${x - width / 2}px`;
      htmlElement.style.top = `${y - height / 2}px`;
      htmlElement.style.position = 'absolute';
      htmlElement.style['background-color' as any] =
        this.chartBackgroundCssColor;
      htmlElement.style[
        'border-radius' as any
      ] = `${this.chartBackgroundBorderRadius}%`;
    });

    // TODO should we always replace the html elements or is there a better way?
    // TODO should we compare zoomlevels and only replace elements
    // when we are actually switching from one zoom level to the next?
    const htmlElements = charts.map(c => c.htmlElement);
    this.div.replaceChildren(...htmlElements);

    return this.div;
  }
}
