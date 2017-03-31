import { ImageLoader } from '@squarespace/core';
import debounce from 'lodash/debounce';
import { getImageRatio } from '../util';

const MODULE_CLASSES = {
  wrapperSelector: 'top-align-wrapper',
  childSelector: 'top-align-item-wrapper'
};

const MODULE_DEFAULTS = {
  maxColumns: 12,
  minColumnWidth: 300,
  gutter: 5,
  autoLoadImages: false
};

/**
 * Lays out a set of items in a top-aligned grid.
 */
class TopAlign {

  /**
   * @param {HTMLElement} rootNode - wrapper around the elements to be aligned
   * @param {Object} config
   * @param {Number} gutter - space between items (in pixels; default 5)
   * @param {Number} minColumnWidth - min width of columns (in pixels; default 300)
   * @param {Number} maxColumns - max number of columns to be used on large screens (default 12)
   * @param {String} childSelector - class name of the children to be layed out
   * @param {Function} afterLayout - function to be run after all items are layed out
   * @param {Boolean} autoLoadImage - set to true for class to load images (default false)
   * @param {String} imageCropping - value for the image cropping setting (default 'none')
   */
  constructor(rootNode, config = {}) {
    this.config = Object.assign({}, MODULE_DEFAULTS, config);

    this.rootNode = rootNode;
    if (!this.rootNode.nodeName) {
      throw new Error('No root element given');
    }
    if (!this.rootNode.classList.contains(MODULE_CLASSES.wrapperSelector)) {
      this.rootNode.classList.add(MODULE_CLASSES.wrapperSelector);
    }

    this.items = this.setupItems();
  }

  /**
   * Adds module classes to all elements.
   */
  setupItems() {
    const configSelectorArray = Array.from(this.rootNode.querySelectorAll('.' + this.config.childSelector));
    configSelectorArray.forEach((selector) => {
      selector.classList.add(MODULE_CLASSES.childSelector);
    });
  }

  /**
   * Determines the aspect ratio for the images based on a tweak setting.
   * If set to 'none,' sets the aspect ratio to the image's natural aspect ratio.
   *
   * @param {HTMLElement} img - image node
   */
  determineImageWrapperPadding(img) {
    if (this.config.imageCropping === 'square') {
      return 100;
    } else if (this.config.imageCropping === 'horizontal') {
      return 75;
    } else if (this.config.imageCropping === 'vertical') {
      return 133;
    }
    return getImageRatio(img);
  }

  /**
   * Set padding on image node's parent.
   *
   * @param {HTMLElement} img
   */
  setUpImageWrapper(img) {
    const padding = this.determineImageWrapperPadding(img);
    img.parentNode.style.paddingBottom = Math.floor(padding) + '%';
  }

  loadImage(img) {
    ImageLoader.load(img, {
      mode: null,
      load: true
    });
  }

  /**
  /**
   * Returns the number of columns in the grid
   *
   * @param {Number} wrapperWidth - width of the wrapper around the elements in the grid
   */
  getNumberOfColumns(wrapperWidth) {
    // first divide available width by minColumnWidth setting
    let calculatedCols = Math.floor((wrapperWidth + this.config.gutter) / (this.config.minColumnWidth + this.config.gutter));
    // then, get the min of columns that fit vs. the max number of columns specified...
    calculatedCols = Math.min(calculatedCols, this.config.maxColumns);
    // then make sure you don't end up with 0 columns.
    return Math.max(calculatedCols, 1);
  }

  /**
   * Returns the width of each column
   *
   * @param {Number} numCols - number of columns in the grid
   */
  getFinalColumnWidth (numCols) {
    const containerWidth = Math.floor(this.rootNode.offsetWidth);
    return Math.floor((containerWidth - ((numCols - 1) * this.config.gutter)) / numCols);
  }

  /**
   * Build the grid.
   */
  layout(updatedConfig = {}) {
    if (updatedConfig) {
      Object.keys(updatedConfig).forEach(prop => {
        if (this.config.hasOwnProperty(prop)) {
          this.config[prop] = updatedConfig[prop];
        }
      });
    }

    const wrapperWidth = this.rootNode.offsetWidth;
    const numCols = this.getNumberOfColumns(wrapperWidth);
    const colWidth = this.getFinalColumnWidth(numCols);
    const itemsArray = Array.from(this.rootNode.querySelectorAll('.' + this.config.childSelector));

    // body class to set nth-child to remove margin from last column
    this.rootNode.classList.add('col-' + numCols + '-grid');

    // load all images and set col width
    itemsArray.forEach((item) => {
      item.style.width = colWidth + 'px';

      let img = item.querySelector('img');
      if (img && this.config.autoLoadImages) {
        img.removeAttribute('data-load');
        this.setUpImageWrapper(img);
        this.loadImage(img);
      }
    });

    if (typeof this.config.afterLayout === 'function') {
      this.config.afterLayout();
    }
  }

  /**
   * Remove all inline styles and the col num class on the rootNode
   */
  reset() {
    const wrapperClassArray = this.rootNode.className.split(/col-.-grid/g).join('');
    this.rootNode.className = wrapperClassArray;
    const items = this.rootNode.querySelectorAll('.' + this.config.childSelector);
    Array.from(items).forEach((item) => {
      item.style.width = '';
    });
  }

  /**
   * Reset all styles, remove all class names and event listeners.
   */
  destroy() {
    this.reset();

    const items = this.rootNode.querySelectorAll('.' + MODULE_CLASSES.childSelector);
    Array.from(items).forEach((item) => {
      item.classList.remove(MODULE_CLASSES.childSelector);
    });

    if (this.config.wrapperSelector !== MODULE_CLASSES.wrapperSelector) {
      this.rootNode.classList.remove(MODULE_CLASSES.wrapperSelector);
    }
  }

  /**
   * Reset styles, then rebuild grid.
   */
  afterResize() {
    this.reset();
    this.layout();
  }
}

export default TopAlign;