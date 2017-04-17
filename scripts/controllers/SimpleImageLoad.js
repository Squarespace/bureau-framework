import { ImageLoader, Tweak } from '@squarespace/core';
import debounce from 'lodash/debounce';


function SimpleImageLoad(element) {

  const load = function () {

    const images = element.querySelectorAll('img[data-src]');

    for (let i = 0; i < images.length; i++) {

      const image = images[i];
      const imageWrapper = image.parentNode;
      let mode = null;

      if (imageWrapper.classList.contains('content-fill')) {
        mode = 'fill';
      } else if (imageWrapper.classList.contains('content-fit')) {
        mode = 'fit';
      }

      ImageLoader.load(images[i], {
        load: true,
        mode: mode
      });

    }

  };

  // Bind resize handler
  const debouncedResize = debounce(load, 200);
  window.addEventListener('resize', debouncedResize);

  // Tweak handler
  const tweaksFromDOM = element.getAttribute('data-tweaks');

  if (tweaksFromDOM && tweaksFromDOM.length > 0) {

    const tweaks = tweaksFromDOM.split(',').map(function (tweakName) {
      return tweakName.trim();
    });

    Tweak.watch(tweaks, load);

  }

  // Init
  load();

}

export default SimpleImageLoad;