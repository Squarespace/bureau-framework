import { ImageLoader } from '@squarespace/core';
import debounce from 'lodash/debounce';
import { getImageRatio } from '../util';

const MODULE_CLASSES = {
  wrapperSelector: 'baseline-wrapper',
  childSelector: 'baseline-item-wrapper',
  imgWrapperSelector: 'baseline-image-wrapper',
  titleWrapperSelector: 'baseline-title-wrapper'
};

const MODULE_DEFAULTS = {
  maxColumns: 12,
  minColumnWidth: 300,
  gutter: 5,
  autoLoadImages: false,
  imageCropping: 'none'
};

/**
 * Lays out a set of child elements in a Baseline aligned grid, where each row is vertically
 * aligned around the baseline of its top content, either an image or text.
 */
class Baseline {

  /**
   * @param {HTMLElement} rootNode - wrapper around the elements to be aligned
   * @param {Object} config
   * @param {Number} gutter - space between items (in pixels; default 5)
   * @param {Number} minColumnWidth - min width of columns (in pixels; default 300)
   * @param {Number} maxColumns - max number of columns to be used on large screens (default 12)
   * @param {String} childSelector - class name of the children to be layed out
   * @param {String} imgWrapperSelector - class name of the wrapper around the image
   * @param {String} titleWrapperSelector - class name of the wrapper around the title if no image
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
      const imgWrapper = selector.querySelector('.' + this.config.imgWrapperSelector);
      const titleWrapper = selector.querySelector('.' + this.config.titleWrapperSelector);
      if (imgWrapper) {
        imgWrapper.classList.add(MODULE_CLASSES.imgWrapperSelector);
      } else if (titleWrapper) {
        titleWrapper.classList.add(MODULE_CLASSES.titleWrapperSelector);
      }
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
   * Gets the height of either the tallest image or title in a row.
   *
   * Allows us to then set the margins on the other
   * images & titles and get a baseline alignment.
   *
   * @param {Array} row
   */
  getTallestInRow(row) {
    let tallest = 0;

    row.forEach((item) => {
      const wrapper = item.querySelector('.thumbnail-title-wrapper');
      tallest = Math.max(parseInt(wrapper.offsetHeight, 10), tallest);
    });
    return tallest;
  }

  /**
   * Sets the margin on each item based on the difference between its height
   * and the height of the tallest item.
   *
   * @param {HTMLElement} item
   * @param {Number} tallest - height of the tallest element in the row
   */
  setTopMargin(item, tallest) {
    const imageWrapper = item.querySelector('.' + this.config.imgWrapperSelector);
    const margin = tallest - parseInt(item.querySelector('.thumbnail-title-wrapper').offsetHeight, 10);
    if (imageWrapper) {
      imageWrapper.style.marginTop = margin + 'px';
    } else {
      item.querySelector('.' + this.config.titleWrapperSelector).style.paddingTop = tallest + 'px';
    }
  }

  /**
   * Build the grid, row by row.
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
    const totalRows = Math.ceil(itemsArray.length / numCols);

    let start = 0;
    let end = numCols;
    let row = itemsArray.slice(start, end);

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

    for (let currentRow = 0; currentRow < totalRows; currentRow++) {
      const tallest = this.getTallestInRow(row);

      row.forEach((item) => {
        this.setTopMargin(item, tallest);
      });

      // reset for next row
      start = start + numCols;
      end = end + numCols;
      row = itemsArray.slice(start, end);
    }

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
      const imgWrapper = item.querySelector('.' + this.config.imgWrapperSelector);
      const titleWrapper = item.querySelector('.' + this.config.titleWrapperSelector);
      if (imgWrapper) {
        const img = imgWrapper.querySelector('img');
        imgWrapper.style.marginTop = '';
        img.style.top = '';
        img.style.left = '';
      } else if (titleWrapper) {
        titleWrapper.style.paddingTop = '';
      }
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
      const imgWrapper = item.querySelector('.' + this.config.imgWrapperSelector);
      const titleWrapper = item.querySelector('.' + this.config.titleWrapperSelector);
      if (imgWrapper) {
        imgWrapper.classList.remove(MODULE_CLASSES.imgWrapperSelector);
      } else if (titleWrapper) {
        titleWrapper.classList.remove(MODULE_CLASSES.titleWrapperSelector);
      }
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

export default Baseline;