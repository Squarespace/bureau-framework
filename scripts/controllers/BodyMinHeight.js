import debounce from 'lodash/debounce';

/**
 * If the body is not as tall as the window, adds a min-height.
 * This fixes weird overflow and zoom issues on short pages
 * when the nav is opened in iOS safari.
 */
function BodyMinHeight (element) {

  const sync = () => {
    if (element.offsetHeight < window.innerHeight) {
      element.style.minHeight = window.innerHeight + 'px';
    } else {
      element.style.minHeight = '';
    }
  };

  const debouncedResize = debounce(sync, 200);

  sync();
  window.addEventListener('resize', debouncedResize);

}

export default BodyMinHeight;
