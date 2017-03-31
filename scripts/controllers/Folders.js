import { getSiblingsAsArray } from '../util';

function Folders (element) {
  const subnav = element.querySelector('.subnav');
  const navContainer = document.querySelector('.main-nav-wrapper');
  const folderToggle = element.querySelector('.folder-toggle');

  const getOtherOpenFolder = (folder) => {
    return getSiblingsAsArray(folder, '.folder-open');
  };

  /**
   * Determine if the folder is too tall for its container and whether or not
   * the nav is already scrollable.
   *
   * @return {Boolean}
   */
  const checkFolderOverflow = function () {
    // we don't need to add a scrolling class if the entire nav is already scrollable
    const navAlreadyOverflowing = navContainer.classList.contains('scroll');
    if (navAlreadyOverflowing) {
      return false;
    }

    const folderOverflowing = subnav.getBoundingClientRect().bottom > navContainer.getBoundingClientRect().bottom;
    return folderOverflowing;
  };

  /**
   * Toggle the folder-open class when a folder is clicked and make the
   * container scrollable if necessary.
   */
  const setFolderState = function (e) {
    const currentlyOpenFolder = getOtherOpenFolder(e.target.parentNode, '.folder-open');
    if (currentlyOpenFolder.length > 0) {
      currentlyOpenFolder[0].classList.remove('folder-open');
    }

    e.target.parentNode.classList.toggle('folder-open');
    navContainer.classList.remove('scroll-folder');

    if (e.target.parentNode.classList.contains('folder-open') && checkFolderOverflow()) {
      navContainer.classList.add('scroll-folder');
    }
  };

  folderToggle.addEventListener('click', setFolderState);
}

export default Folders;
