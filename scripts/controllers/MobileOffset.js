import debounce from 'lodash/debounce';

/**
 * Repositions the mobile nav bar if the mobile info bar is turned on.
 */
function MobileOffset (element) {

  const mobileInfoBar = document.querySelector('.sqs-mobile-info-bar');
  const mobileBarHeight = element.offsetHeight;

  const repositionMobileBar = () => {
    if (mobileInfoBar) {
      mobileInfoBar.style.bottom = mobileBarHeight + 'px';
    }
  };

  repositionMobileBar();

  const debouncedResize = debounce(repositionMobileBar, 200);
  window.addEventListener('resize', debouncedResize);

}

export default MobileOffset;
