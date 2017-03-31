/**
 * Toggles the search bar open.
 */
function SearchToggle (element) {

  const searchForm = document.querySelector('.header-search-form');
  const searchInput = searchForm.querySelector('.header-search-form-input');

  const setSearchState = (e) => {
    e.preventDefault();
    document.body.classList.remove('nav-open', 'show-social');
    document.body.classList.toggle('show-search');

    if (document.body.classList.contains('show-search')) {
      searchInput.focus();
    } else {
      searchInput.blur();
    }
  };

  element.addEventListener('click', setSearchState);

}

export default SearchToggle;
