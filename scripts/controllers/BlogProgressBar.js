import debounce from 'lodash/debounce';
import { Tweak } from '@squarespace/core';

/*
 * Behavior for the reading position indicator on blog posts.
  */
function BlogProgressBar (element) {

  const progressPie = element.querySelector('.pie-wrapper');
  const bannerImage = document.querySelector('.blog-item-banner-image img');
  const isProgressIndicatorOn = Tweak.getValue('tweak-show-progress-indicator') === 'true';
  const pieLeft = element.querySelector('.pie--left');
  const pieRight = element.querySelector('.pie--right');
  const maskLeft = element.querySelector('.mask--left');

  let pos = 0;
  let rotation = 0;
  let isScrolling = false;
  let scrollTimeout;

  /**
   * Add/remove 'hide' class for an element in the indicator
   *
   * @param {HTMLElement} el
   * @param {String} displayState
   */
  const setDisplay = (el, displayState) => {
    if (displayState === 'hide') {
      el.classList.add('hide');
    } else {
      el.classList.remove('hide');
    }
  };

  /**
   * Sets rotation and display of elements as page is scrolled.
   *
   * @param {Number} pieLeftRotation - number between 0 & 180
   * @param {Number} pieRightRotation - number between 0 & 360
   * @param {String} pieRightDisplay - 'hide' or 'show'
   * @param {String} maskLeftDisplay - 'hide' or 'show'
   */
  const setDisplayAndStyle = (pieLeftRotation, pieRightRotation, pieRightDisplay, maskLeftDisplay) => {
    pieLeft.style.transform = `rotate(${pieLeftRotation}deg)`;
    pieRight.style.transform = `rotate(${pieRightRotation}deg)`;
    setDisplay(maskLeft, maskLeftDisplay);
    setDisplay(pieRight, pieRightDisplay);
  };

  /**
   * Draw the indicator as you scroll down the page
   *
   * @param {Number} distance - total distance to be scrolled
   * @param {Number} position - current scroll position
   */
  const setPieOnScroll = (distance, position) => {
    progressPie.classList.add('show');
    pos = position;

    // Are we to the end of the post yet? No, ok...
    if ((pos / distance) <= 1) {
      // Degrees of rotation
      rotation = (pos / distance) * 360;
      // Less than halfway, rotate the left half into the right side
      if ((pos / distance) < 0.5) {
        setDisplayAndStyle(rotation, 0, 'hide', 'show');
      // More than halfway, show the whole left half on the right,
      // rotate the right half into the left side.
      } else {
        setDisplayAndStyle(180, rotation, 'show', 'hide');
      }
    // Post is completely scrolled thru, so show everything.
    } else {
      setDisplayAndStyle(180, 360, 'show', 'hide');
    }
  };

  /**
   * Gets the total distance (i.e. height) of the article
   */
  const getTotalDistance = () => {
    return element.getBoundingClientRect().bottom + window.pageYOffset - window.innerHeight;
  };

  /**
   * RAF wrapper
   *
   * @param {Number} dist - total distance to be scrolled
   */
  const scrollCallback = (dist) => {
    setPieOnScroll(dist, window.pageYOffset);
    if (isScrolling === true) {
      window.requestAnimationFrame(() => {
        scrollCallback(dist);
      });
    }
  };

  /**
   * Scroll handler. Starts RAF.
   *
   * @param {Number} dist - total distance to be scrolled
   */
  const handleScroll = (dist) => {
    if (isScrolling === false) {
      isScrolling = true;
      scrollCallback(dist);
    }
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      setTimeout(() => {
        progressPie.classList.remove('show');
      }, 1500);
    }, 100);
  };

  /**
   * Get the total distance and bind the scroll event listener
   */
  const init = () => {
    const dist = getTotalDistance();
    window.addEventListener('scroll', () => {
      handleScroll(dist);
    });
  };

  const debouncedResize = debounce(init, 200);

  /**
   * First, check if the indicator tweak is set to 'on'.
   * Second, check if there's a banner image. If so, wait for it to load to get correct distance.
   * If not, just run init().
   */
  if (isProgressIndicatorOn) {
    if (bannerImage) {
      bannerImage.addEventListener('load', init);
    } else {
      init();
    }
    window.addEventListener('resize', debouncedResize);
  }
}

export default BlogProgressBar;
