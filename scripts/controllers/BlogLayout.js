import debounce from 'lodash/debounce';
import { Tweak } from '@squarespace/core';
import Autocolumns from '@squarespace/layout-autocolumns';
import FontsLoaded from '@squarespace/fonts-loaded';
import constants from '../constants';
import Baseline from '../blog/layout-baseline';
import TopAlign from '../blog/layout-top';
import Ajax from '../blog/blog-ajax';

/**
 * Handles building the blog grid, setting up ajax page loading, and tweak listeners.
 */
function BlogLayout (element) {
  const loadingSpinner = document.querySelector('.loading-spinner');
  let grid;
  let fontsLoaded;
  const gridWrapper = element;
  const footer = document.querySelector('.site-footer');
  let windowWidth = window.innerWidth;
  const tweaksToWatch = [
    'tweak-blog-list-max-width',
    'tweak-cards',
    'tweak-crop-images',
    'tweak-blog-list-grid-narrow-columns',
    'tweak-show-excerpt-on-blog-list',
    'tweak-blog-promoted-meta',
    'tweak-blog-show-divider',
    'tweak-blog-date-style',
    'minColumnWidth',
    'tweak-blog-list-grid-alignment',
    'maxNumberColumns',
    'tweak-blog-divider-height'
  ];

  /**
   * Return various tweak settings needed throughout.
   */
  const getTweakVals = () => {
    return {
      layoutStyle: Tweak.getValue('tweak-blog-list-grid-alignment').toLowerCase(),
      isInfiniteScrollEnabled: Tweak.getValue('tweak-infinite-scroll') === 'true',
      isNarrowColumns: Tweak.getValue('tweak-blog-list-grid-narrow-columns') === 'true',
      cropImagesSetting: Tweak.getValue('tweak-crop-images').toLowerCase(),
      minColWidth: parseInt(Tweak.getValue('minColumnWidth'), 10),
      maxCols: parseInt(Tweak.getValue('maxNumberColumns'), 10)
    };
  };

  /**
   * After all items are placed, remove the hidden class on each one at an interval.
   */
  const gridReveal = () => {
    loadingSpinner.classList.add('hidden');
    footer.classList.remove('show');
    const items = element.querySelectorAll('.grid-hidden');
    let i = 0;
    const interval = setInterval(() => {
      if (items[i]) {
        items[i].classList.remove('grid-hidden');
        i++;
      } else {
        footer.classList.add('show');
        clearInterval(interval);
      }
    }, 130);
  };

  /**
   * Returns gutter value based on window width & the minColWidth tweak.
   */
  const getGutter = () => {
    const minColWidth = getTweakVals().minColWidth;
    if (window.innerWidth <= constants.mobileBreakpoint) {
      return 0.1 * minColWidth;
    }

    return 0.25 * minColWidth;
  };

  /**
   * Render the gallery.
   *
   * @param {Boolean} shouldDestroy - true = delete grid object and rebuild in new style
   */
  const render = (shouldDestroy) => {
    if (shouldDestroy && grid) {
      const items = element.querySelectorAll('.entry--list');
      Array.from(items).forEach((item) => {
        item.classList.add('grid-hidden');
      });
      grid.destroy();
      grid = null;
    }

    const tweakVals = getTweakVals();

    if (tweakVals.layoutStyle === 'masonry') {
      grid = new Autocolumns(gridWrapper, {
        gutter: getGutter(),
        minColumns: 1,
        maxColumns: tweakVals.maxCols,
        minColumnWidth: tweakVals.minColWidth,
        childSelector: '.entry--list',
        imageWrapperSelector: '.excerpt-image',
        afterLayout: gridReveal,
        autoLoadImages: true
      });
      if (element.querySelector('.blog-list h2.entry-title')) {
        fontsLoaded = new FontsLoaded([element.querySelector('.blog-list h2.entry-title')]);
        fontsLoaded.check().then(() => {
          grid.layout();
        });
      } else {
        grid.layout();
      }
    } else if (tweakVals.layoutStyle === 'baseline') {
      grid = new Baseline(gridWrapper, {
        gutter: getGutter(),
        maxColumns: tweakVals.maxCols,
        minColumnWidth: tweakVals.minColWidth,
        childSelector: 'entry--list',
        imgWrapperSelector: 'excerpt-thumb',
        titleWrapperSelector: 'entry-title-wrapper',
        afterLayout: gridReveal,
        autoLoadImages: true,
        imageCropping: tweakVals.cropImagesSetting
      });
      if (element.querySelector('.blog-list h2.entry-title')) {
        fontsLoaded = new FontsLoaded([element.querySelector('.blog-list h2.entry-title')]);
        fontsLoaded.check().then(() => {
          grid.layout();
        });
      } else {
        grid.layout();
      }
    } else {
      grid = new TopAlign(gridWrapper, {
        gutter: getGutter(),
        maxColumns: tweakVals.maxCols,
        minColumnWidth: tweakVals.minColWidth,
        childSelector: 'entry--list',
        afterLayout: gridReveal,
        autoLoadImages: true,
        imageCropping: tweakVals.cropImagesSetting
      });
      grid.layout();
    }
  };

  /**
   * First, hide all the items, then run grid.afterResize, then reveal the items.
   */
  const resizeHandler = () => {
    // check to see if the width actually changed to avoid running
    // when the bar comes in on scroll on ios.
    if (windowWidth === window.innerWidth) {
      return;
    }

    const items = element.querySelectorAll('.entry--list');
    Array.from(items).forEach((item) => {
      item.classList.add('grid-hidden');
    });
    if (grid) {
      grid.afterResize();
    }
    gridReveal();
    windowWidth = window.innerWidth;
  };

  const debouncedResize = debounce(resizeHandler, 120);

  /**
   * Render the grid, bind the resize listener and the ajax listener.
   */
  const init = () => {
    render(false);
    window.addEventListener('resize', debouncedResize);

    const nextPageHandler = new Ajax(element, {
      itemSelector: '.entry--list',
      loadMoreSelector: '.load-more',
      pageEndSelector: '.site-footer',
      loadingSpinnerSelector: '.loading-spinner',
      renderCallback: render,
      isInfiniteScroll: getTweakVals().isInfiniteScrollEnabled
    });
    nextPageHandler.bindEventListener();
  };

  init();

  Tweak.watch(tweaksToWatch, (tweak) => {
    const renderTriggeringTweaks = [
      'tweak-crop-images',
      'minColumnWidth',
      'tweak-blog-list-grid-alignment',
      'maxNumberColumns'
    ];
    const needsRenderUpdate = renderTriggeringTweaks.some((name) => {
      return tweak.name === name;
    });

    if (needsRenderUpdate) {
      render(true);
    } else {
      render(false);
    }
  });
}

export default BlogLayout;
