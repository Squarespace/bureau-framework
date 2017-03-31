import debounce from 'lodash/debounce';
import constants from '../constants';

/*
 * Shrinks the header as you scroll down the page
 */
function HeaderScroll (element) {
  let scrollTimeout;
  let isScrolling = false;
  let pos = 0;
  const header = element.querySelector('.header-announcement-wrapper');
  const headerInner = header.querySelector('.site-header');
  const closeToggle = element.querySelector('.nav-close-toggle-wrapper');
  const headerPadding = parseInt(window.getComputedStyle(headerInner).getPropertyValue('padding-top'), 10);
  const headerPaddingOffset = headerPadding > 20 ? 20 : headerPadding;

  const determineHeaderState = () => {
    pos = window.pageYOffset;
    element.classList.remove('header-tucked');
    if (pos > 0 && pos < headerPadding) {
      header.style.transform = `translateY(${-1 * pos}px)`;
      closeToggle.style.transform = `translateY(${-1 * pos}px)`;
    } else if (pos >= headerPadding) {
      header.style.transform = `translateY(${-1 * (headerPadding - headerPaddingOffset)}px)`;
      closeToggle.style.transform = `translateY(${-1 * (headerPadding - headerPaddingOffset)}px)`;
      element.classList.add('header-tucked');
    } else {
      header.style.transform = 'translateY(0)';
      closeToggle.style.transform = 'translateY(0)';
    }
  };

  /**
   * RAF wrapper
   */
  const scrollCallback = () => {
    determineHeaderState();
    if (isScrolling === true) {
      window.requestAnimationFrame(scrollCallback);
    }
  };

  /**
   * Scroll handler. Starts the RAF.
   */
  const handleScroll = () => {
    if (isScrolling === false) {
      isScrolling = true;
      scrollCallback();
    }
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 100);
  };

  const sync = () => {
    window.removeEventListener('scroll', handleScroll);
    if (window.innerWidth <= constants.tabletBreakpoint) {
      return;
    }
    window.addEventListener('scroll', handleScroll);
  };

  sync();

  const debouncedResize = debounce(sync, 200);
  window.addEventListener('resize', debouncedResize);

}

export default HeaderScroll;
