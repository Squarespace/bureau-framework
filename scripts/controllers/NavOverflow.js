import debounce from 'lodash/debounce';
import { isTooTall } from '../util';
import { Tweak } from '@squarespace/core';

/*
 * Is the nav overflowing its fixed-position container?
 * If so, add a class to make it overflow: auto.
 */
function NavOverflow (element) {
  const tweaksToWatch = [
    'tweak-nav-font',
    'tweak-navigation-link-spacing'
  ];

  const rootNode = element.querySelector('.nav-blocks-wrapper');
  const navPadding = 140;

  var checkForOverflow = function () {
    element.classList.remove('scroll');
    if (isTooTall(rootNode, element, navPadding)) {
      element.classList.add('scroll');
    }
  };

  checkForOverflow();

  const debouncedResize = debounce(checkForOverflow, 200);
  window.addEventListener('resize', debouncedResize);

  Tweak.watch(tweaksToWatch, () => {
    checkForOverflow();
  });
}

export default NavOverflow;
