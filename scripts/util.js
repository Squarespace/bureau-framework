import '@squarespace/polyfills/Element/matches';

/**
 * Determines if a given node is too tall for its boundary node, minus any padding.
 *
 * @param {HTMLElement} rootNode
 * @param {HTMLElement} heightBoundaryNode - (optional) rootNode.parentNode is used when not provided
 * @param {Integer}     padding - (optional) amount of padding inside heightBoundaryNode
 */
export const isTooTall = (rootNode, heightBoundaryNode, padding) => {
  heightBoundaryNode = heightBoundaryNode || rootNode.parentNode;
  const rootNodeHeight = rootNode.clientHeight;
  const heightBoundaryNodeHeight = heightBoundaryNode.clientHeight;

  if (rootNodeHeight > (heightBoundaryNodeHeight - (padding * 2))) {
    return true;
  }

  return false;
};

/**
 * Returns an img's dimensions as a % of height/width from it's data-image-dimenstions attribute
 *
 * @param {HTMLElement}  img   Required
 */
export const getImageRatio = (img) => {
  // this conditional is a hack to get around the fact that system placeholder
  // images get their data-image-dimensions attr set late
  if (img.getAttribute('data-image-dimensions') !== '') {
    const [ x, y ] = img.getAttribute('data-image-dimensions').split('x').map(dim => parseFloat(dim, 10));
    return 100 * y / x;
  }

  return 100;
};

export const getSiblingsAsArray = (el, filterBySelector = '*') => {
  const children = Array.from(el.parentNode.children);
  return children.filter((child) => {
    return child !== el && child.matches(filterBySelector);
  });
};


