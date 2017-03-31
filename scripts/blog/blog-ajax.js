import debounce from 'lodash/debounce';

/**
 * This class handles asynchronous loading of blog pages either through a Load More button
 * or in an Infinite Scroll style based on scrolling to a trigger node.
 */
class Ajax {

  /**
   * @param  {HTMLElement}  rootNode
   * @param  {Object}       config
   * @param  {String}       config.itemSelector             Selector for each item being loaded
   * @param  {String}       config.loadMoreSelector         Selector for the Load More button
   * @param  {String}       config.pageEndSelector          Selector for the infinite scroll trigger point
   * @param  {String}       config.loadingSpinnerSelector   Selector for the loading spinner
   * @param  {Function}     config.renderCallback           Function that renders the new items in the grid
   * @param  {Boolean}      config.isInfinteScroll          Is infinite scroll enabled
   */
  constructor(rootNode, config = {}) {
    this.rootNode = rootNode;

    this.itemSelector = config.itemSelector;
    this.items = this.rootNode.querySelectorAll(this.itemSelector);
    this.loadMoreBtn = document.querySelector(config.loadMoreSelector);
    this.pageEndNode = document.querySelector(config.pageEndSelector);
    this.loadingSpinner = document.querySelector(config.loadingSpinnerSelector);
    this.renderCallback = config.renderCallback;
    this.isInfiniteScroll = config.isInfiniteScroll;

    this.debouncedInfiniteScrollHandler = debounce(this.infiniteScrollHandler, 200);
    this.boundDebouncedInfiniteScrollHandler = this.debouncedInfiniteScrollHandler.bind(this);
    this.boundLoadNextPage = this.loadNextPage.bind(this);
  }

  /*
  * Binds the correct event listener
  */
  bindEventListener () {
    if (this.isInfiniteScroll) {
      window.addEventListener('scroll', this.boundDebouncedInfiniteScrollHandler)
    } else if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', this.boundLoadNextPage);
    }
  }

  /*
  * XHR request for the next page. Returns a promise.
  */
  requestNextPage (url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        resolve(xhr.response);
      };
      xhr.open('GET', url, true);
      xhr.responseType = 'document';
      xhr.send();
    });
  }

  /*
  * Builds the url for the next page based on the data attribute of the current last child,
  * and whether or not the current url has a query param.
  */
  getNextPageUrl () {
    const offset = this.rootNode.querySelector(`${this.itemSelector}:last-child`).getAttribute('data-offset');
    const location = window.location.href.toString();
    let newQueryParams = `offset=${offset}&format=main-content`;
    if (location.indexOf('?') > -1) { // does the url have a query param?
      newQueryParams = '&' + newQueryParams;
    } else {
      newQueryParams = '?' + newQueryParams;
    }
    const request = location + newQueryParams;
    return request;
  }

  /*
  * Requests and loads the next page when user scrolls to the trigger node.
  * If that is the last page, adds the 'last-page' class to the wrapper.
  * If not, adds the scroll event listener back to the window.
  */
  infiniteScrollHandler () {
    const windowHeight = window.innerHeight;
    const footerStart = this.pageEndNode.getBoundingClientRect().top;
    const scrollY = window.pageYOffset;
    if (scrollY + windowHeight >= footerStart + scrollY) {
      this.loadingSpinner.classList.remove('hidden');
      window.removeEventListener('scroll', this.boundDebouncedInfiniteScrollHandler);  
      const request = this.getNextPageUrl();
      this.requestNextPage(request).then((result) => {      
        const nextPage = result.querySelectorAll(this.itemSelector);

        nextPage.forEach((post) => {
          this.rootNode.appendChild(post);
        });
        this.renderCallback();
        this.loadingSpinner.classList.add('hidden');        
        if (this.rootNode.querySelector(`${this.itemSelector}[data-last-page]`)) {
          this.rootNode.classList.add('last-page');
        } else {
          window.addEventListener('scroll', this.boundDebouncedInfiniteScrollHandler);          
        }
      }).catch((reason) => {
        console.warn(`The next page failed to load: ${reason}`);       
      });
    }
  }

  /*
  * Requests and loads the next page when user clicks the Load More button.
  * If that is the last page, adds the 'last-page' class to the wrapper and removes the
  * click event listener from the button.
  */
  loadNextPage (e) {
    e.preventDefault();
    const request = this.getNextPageUrl();
    this.requestNextPage(request).then((result) => {
      const nextPage = result.querySelectorAll(this.itemSelector);

      nextPage.forEach((post) => {
        this.rootNode.appendChild(post);
      });
      this.renderCallback();
      const newOffset = this.rootNode.querySelector(`${this.itemSelector}:last-child`).getAttribute('data-offset');
      if (this.loadMoreBtn) {
        this.loadMoreBtn.setAttribute('href', `/?offset=${newOffset}`);
      }
      if (this.rootNode.querySelector(`${this.itemSelector}[data-last-page]`)) {
        if (this.loadMoreBtn) {
          this.loadMoreBtn.removeEventListener('click', this.boundLoadNextPage);
        }
        this.rootNode.classList.add('last-page');
      }
    }).catch((reason) => {
      console.warn(`The next page failed to load: ${reason}`);
    });
  }

}

export default Ajax;