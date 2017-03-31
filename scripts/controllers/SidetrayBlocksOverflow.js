import debounce from 'lodash/debounce';
import { isTooTall } from '../util';
/**
 * Is the sidetray bar overflowing its fixed-position container?
 * If so, add a class to make it overflow: auto.
 */
function SidetrayBlocksOverflow (element) {

  const rootNode = element.querySelector('.sidetray-blocks-wrapper');
  const padding = 140;

  var init = function () {
    if (isTooTall(rootNode, element, padding)) {
      element.classList.add('scroll');
    } else {
      element.classList.remove('scroll');
    }
  };

  init();

  const debouncedResize = debounce(init, 200);

  window.addEventListener('resize', debouncedResize);

}

export default SidetrayBlocksOverflow;
