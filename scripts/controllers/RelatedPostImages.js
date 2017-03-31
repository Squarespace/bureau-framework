import { ImageLoader, Tweak } from '@squarespace/core';
import { getImageRatio } from '../util';

/**
 * If images are not cropped, sets an intrinsic padding on the related post image wrappers.
 * Otherwise, image wrapper padding is set in CSS.
 */
function RelatedPostImages (element) {

  const images = Array.from(element.querySelectorAll('.thumbnail-title-wrapper img'));

  const setImagePadding = () => {
    images.forEach((img) => {
      const imgRatio = getImageRatio(img);
      img.parentNode.style.paddingBottom = imgRatio + '%';

      ImageLoader.load(img, {
        mode: 'fill',
        load: true,
        fixedRatio: true
      });
    });
  };

  const resetPadding = () => {
    images.forEach((img) => {
      img.parentNode.style.paddingBottom = '';
    });
  };

  if (Tweak.getValue('tweak-crop-images').toLowerCase() === 'none') {
    setImagePadding();
  }

  Tweak.watch('tweak-crop-images', (tweak) =>{
    if (tweak.value.toLowerCase() === 'none') {
      setImagePadding();
    } else {
      resetPadding();
    }
  });
}

export default RelatedPostImages;
