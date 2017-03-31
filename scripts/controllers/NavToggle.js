/**
 * Functionality for nav toggle menu button.
 */
function NavToggle (element) {

  const navOverlay = document.querySelector('.nav-close-overlay');

  const setNavState = () => {
    document.body.classList.remove('show-search', 'show-social');
    document.body.classList.toggle('nav-open');
  };

  const closeNav = () => {
    document.body.classList.remove('nav-open');
  };

  element.addEventListener('click', setNavState);
  navOverlay.addEventListener('click', closeNav);

}

export default NavToggle;
