import debounce from 'lodash/debounce';

/*
 * Adds 'scrolling' class to body while scrolling;
 * to turn off hover effects and increase performance.
 */
function AddScrollingClass (element) {
  let isBeingScrolled = false;

  const handleScroll = () => {
    if (isBeingScrolled === true) {
      return;
    }

    isBeingScrolled = true;
    element.classList.add('is-being-scrolled');
  };

  const isStillScrolling = () => {
    element.classList.remove('is-being-scrolled');
    isBeingScrolled = false;
  };

  const debouncedScrollDetector = debounce(isStillScrolling, 200);

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('scroll', debouncedScrollDetector);
}

export default AddScrollingClass;
