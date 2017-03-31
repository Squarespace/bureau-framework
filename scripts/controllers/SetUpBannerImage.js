import { ImageLoader, Tweak } from '@squarespace/core';
import { getImageRatio } from '../util';

/**
 * Adds a class to the body to constrain the banner image if it's
 * square or vertical so it doesn't take up too much of the page.
 */
function SetUpBannerImage (element) {

  const isBannerWidthNormal = Tweak.getValue('tweak-blog-item-banner-image-width') === 'Normal';
  const bannerImage = element.querySelector('img');
  const imgRatio = getImageRatio(bannerImage);

  const addBodyClass = () => {
    if (isBannerWidthNormal) {
      if (imgRatio <= 100 && imgRatio >= 75) {
        document.body.classList.add('constrain-banner--mid');
      } else if (imgRatio > 100) {
        document.body.classList.add('constrain-banner--narrow');
      }
    }
  };

  const loadBannerImage = () => {
    addBodyClass();
    ImageLoader.load(bannerImage, {
      mode: 'fill',
      load: true,
      fixedRatio: true
    });
  };

  loadBannerImage();

  Tweak.watch('tweak-blog-item-banner-image-width', loadBannerImage);
}

export default SetUpBannerImage;
