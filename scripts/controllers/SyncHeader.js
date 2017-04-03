import { Tweak } from '@squarespace/core';
import debounce from 'lodash/debounce';

/*
 * Positions stuff around the fixed header.
 * Also handles collisions between elements in the header.
 * Combined into a single controller to avoid race condition.
 */
function SyncHeader (element) {
  const tweaksToWatch = [
    'headerPaddingScale',
    'tweak-site-title-font',
    'tweak-site-tagline-font',
    'tweak-show-site-tagline',
    'tweak-site-branding-layout',
    'logoHeight',
    'tweak-show-search-in-header',
    'tweak-show-social-in-header'
  ];

  const header = element.querySelector('.site-header');
  const headerSpecial = element.querySelector('.header-special');
  const socialSearch = element.querySelector('.social-search-wrapper');
  const pageWrapper = element.querySelector('.site-page');
  const navCloseToggleWrapper = element.querySelector('.nav-close-toggle-wrapper');
  const siteTitle = element.querySelector('.site-title');
  const logoImage = element.querySelector('.logo-image');
  const customCart = element.querySelector('.sqs-custom-cart');
  const padding = 20;

  const getElementWidths = () => {
    return {
      headerHeight: header.offsetHeight,
      headerWidth: header.offsetWidth,
      headerSpecialWidth: headerSpecial.offsetWidth,
      socialSearchWidth: socialSearch.offsetWidth,
      brandingWidth: siteTitle ? siteTitle.offsetWidth : logoImage.offsetWidth,
      cartWidth: customCart ? customCart.offsetWidth : 0
    };
  };

  /**
   * Sets the margin on the page content area to make room for the fixed header.
   */
  const setMargins = () => {
    // Header is relative under the tablet breakpoint.
    // The close icon is outside the header, so it needs to be kept in line separately.
    if (window.innerWidth <= 768) {
      pageWrapper.style.marginTop = '';
      navCloseToggleWrapper.style.height = '';
      return;
    }

    const headerHeight = getElementWidths().headerHeight;
    pageWrapper.style.marginTop = headerHeight + 'px';
    navCloseToggleWrapper.style.height = headerHeight + 'px';
  };

  /**
   * Manages the title/tagline wrapping and the social icon overflow.
   * Also hides the header elements until no-wrap has been resolved.
   */
  const syncHeaderElements = () => {
    header.classList.remove('collapse');
    header.classList.add('no-wrap');
    const elementWidths = getElementWidths();
    const headerWidth = elementWidths.headerWidth;
    const headerSpecialWidth = elementWidths.headerSpecialWidth;
    const socialSearchWidth = elementWidths.socialSearchWidth;
    const aboveMobileBarBreakpoint = window.innerWidth > 768;
    const specialIconsTooWide = socialSearchWidth + elementWidths.cartWidth + padding >= headerSpecialWidth;

    // If below the mobile bar breakpoint (i.e., where the mobile nav bar shows up),
    // allow the title and tagline to wrap if it's wider than the header + PADDING.
    if (!aboveMobileBarBreakpoint && elementWidths.brandingWidth + padding >= headerWidth) {
      header.classList.remove('no-wrap');

    // Otherwise, see if the elements in the right header section are bigger
    // than their flex-boxed area. If so, add the collapse class and allow their
    // title and tagline to wrap.
    } else if (aboveMobileBarBreakpoint && specialIconsTooWide) {
      header.classList.add('collapse');
      header.classList.remove('no-wrap');
    }

    // Show the header.
    header.classList.remove('loading');
  };

  const setUpHeader = () => {
    syncHeaderElements();
    setMargins();
  };

  setUpHeader();

  Tweak.watch(tweaksToWatch, (tweak) => {
    if (tweak.name === 'headerPaddingScale') {
      setMargins();
    } else {
      syncHeaderElements();
    }
  });

  const debouncedResize = debounce(setUpHeader, 200);
  window.addEventListener('resize', debouncedResize);

}

export default SyncHeader;
