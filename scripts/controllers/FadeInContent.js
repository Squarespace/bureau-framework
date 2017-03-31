/**
 * Fades in content via loading class on the <main>
 */
function FadeInContent (element) {
  let fadeInTimeout;

  const removeLoadingClass = () => {
    if (element.classList.contains('loading')) {
      element.classList.remove('loading');
    }
  };

  const delayedFade = () => {
    if (fadeInTimeout) {
      clearTimeout(fadeInTimeout);
    }

    fadeInTimeout = setTimeout(removeLoadingClass, 200);
  };

  delayedFade();
}

export default FadeInContent;
