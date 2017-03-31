/**
 * Toggles the social buttons open when they're too long to fit.
 */
function SocialToggle (element) {

  const setSocialState = () => {
    document.body.classList.remove('show-search', 'nav-open');
    document.body.classList.toggle('show-social');
  };

  element.addEventListener('click', setSocialState);

}

export default SocialToggle;
