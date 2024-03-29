import { isNullOrEmpty } from './mcs-object.function';

export interface IMcsClientRect {
  bottom: number;
  left: number;
  right: number;
  top: number;

  height: number;
  width: number;

  x?: number;
  y?: number;
}

/**
 * Get style of the element based on the property given
 *
 * `@Note` The style property maps onto the HTML style attribute,
 * not the cascaded or computed style. Thats why this function was created.
 * @param element Target element to get the property value
 * @param property Property to read the value of (i.e: position, display, etc...)
 */
export function getElementStyle(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element)[property];
}

/**
 * Get the nearest ancestor element from the target element.
 * The offset parent element return the nearest ancestor element
 * that has a position other than static
 * @param element Target element to find the static parent element
 */
export function getOffsetParent(element: HTMLElement): HTMLElement {
  let parentElement = element.offsetParent as HTMLElement || document.documentElement;

  // Checking of static element, It will return true when the element is static else false
  let isParentStatic = (parentElementRef: HTMLElement) => {
    return (getElementStyle(parentElementRef, 'position') || 'static') === 'static';
  };

  // Find the nearest static parent element based on the inputted element
  while (parentElement && parentElement !== document.documentElement
    && isParentStatic(parentElement)) {
    parentElement = parentElement.offsetParent as HTMLElement;
  }

  // Return the nearest static element (parent element)
  return parentElement || document.documentElement;
}

/**
 * Get the element offset based on the viewport.
 * This is an absolute position from the viewport.
 * @param element Target element to get the offset value
 */
export function getElementOffset(element: HTMLElement): IMcsClientRect {
  // get element bounding client rectangle from the viewport
  let elementBoundingBox = element.getBoundingClientRect();

  // calculate viewport offset of the element
  let viewportOffset = {
    top: window.pageYOffset - document.documentElement.clientTop,
    left: window.pageXOffset - document.documentElement.clientLeft
  };

  // calculate actual element offset from the viewport
  let elementOffset = {
    height: elementBoundingBox.height || element.offsetHeight,
    width: elementBoundingBox.width || element.offsetWidth,
    top: elementBoundingBox.top + viewportOffset.top,
    bottom: elementBoundingBox.bottom + viewportOffset.top,
    left: elementBoundingBox.left + viewportOffset.left,
    right: elementBoundingBox.right + viewportOffset.left
  } as IMcsClientRect;

  return elementOffset;
}

/**
 * Get the element position based on its element ancestor(Parent Element)
 * This is an absolute position from its ancestor element.
 * @param element Target element to get the position
 */
export function getElementPosition(element: HTMLElement): IMcsClientRect {
  let elementPosition: IMcsClientRect;

  if (getElementStyle(element, 'position') === 'fixed') {
    elementPosition = element.getBoundingClientRect();
  } else {
    let parentStaticElement = getOffsetParent(element);

    elementPosition = getElementOffset(element);

    if (parentStaticElement !== document.documentElement) {
      let parentOffset: IMcsClientRect;
      parentOffset = getElementOffset(parentStaticElement);

      parentOffset.top += parentStaticElement.clientTop;
      parentOffset.left += parentStaticElement.clientLeft;

      elementPosition.top -= parentOffset.top;
      elementPosition.bottom -= parentOffset.top;
      elementPosition.left -= parentOffset.left;
      elementPosition.right -= parentOffset.left;
    }
  }

  return elementPosition;
}

/**
 * Get the element position from the host element position
 * based on the given placement (top, right, bottom, or left)
 * @param hostElement Host element that serves as the basis of the position
 * @param targetElement Target element to which it will attach to the host element
 * @param placement Position of the target element around the host element
 * (top, right, bottom, or left)
 * @param appendToBody When "true" the position will be based on the body else "false"
 *
 * `@Note:` Need to use this inside ngZone when angular view is stable to
 * get the actual size of the host and target element.
 */
export function getElementPositionFromHost(
  hostElement: HTMLElement,
  targetElement: HTMLElement,
  placement: string,
  appendToBody: boolean = false
) {
  let hostElementPosition = appendToBody ?
    getElementOffset(hostElement) :
    getElementPosition(hostElement);

  let shiftWidth: any = {
    left: hostElementPosition.left,
    center: (hostElementPosition.left + hostElementPosition.width / 2
      - targetElement.offsetWidth / 2),
    right: (hostElementPosition.left + hostElementPosition.width)
  };

  let shiftHeight: any = {
    top: hostElementPosition.top,
    center: (hostElementPosition.top + hostElementPosition.height / 2
      - targetElement.offsetHeight / 2),
    bottom: hostElementPosition.top + hostElementPosition.height
  };

  let targetElementBoundingBox = targetElement.getBoundingClientRect();
  let placementPrimary = placement.split('-')[0] || 'top';
  let placementSecondary = placement.split('-')[1] || 'center';

  let targetElementPosition = {
    height: targetElementBoundingBox.height || targetElement.offsetHeight,
    width: targetElementBoundingBox.width || targetElement.offsetWidth,
    top: 0,
    bottom: targetElementBoundingBox.height || targetElement.offsetHeight,
    left: 0,
    right: targetElementBoundingBox.width || targetElement.offsetWidth
  } as IMcsClientRect;

  switch (placementPrimary) {
    case 'top':
      targetElementPosition.top = hostElementPosition.top - targetElement.offsetHeight;
      targetElementPosition.bottom += hostElementPosition.top - targetElement.offsetHeight;
      targetElementPosition.left = shiftWidth[placementSecondary];
      targetElementPosition.right += shiftWidth[placementSecondary];
      break;
    case 'bottom':
      targetElementPosition.top = shiftHeight[placementPrimary];
      targetElementPosition.bottom += shiftHeight[placementPrimary];
      targetElementPosition.left = shiftWidth[placementSecondary];
      targetElementPosition.right += shiftWidth[placementSecondary];
      break;
    case 'left':
      targetElementPosition.top = shiftHeight[placementSecondary];
      targetElementPosition.bottom += shiftHeight[placementSecondary];
      targetElementPosition.left = hostElementPosition.left - targetElement.offsetWidth;
      targetElementPosition.right += hostElementPosition.left - targetElement.offsetWidth;
      break;
    case 'right':
    default:
      targetElementPosition.top = shiftHeight[placementSecondary];
      targetElementPosition.bottom += shiftHeight[placementSecondary];
      targetElementPosition.left = shiftWidth[placementPrimary];
      targetElementPosition.right += shiftWidth[placementPrimary];
      break;
  }

  targetElementPosition.top = Math.round(targetElementPosition.top);
  targetElementPosition.bottom = Math.round(targetElementPosition.bottom);
  targetElementPosition.left = Math.round(targetElementPosition.left);
  targetElementPosition.right = Math.round(targetElementPosition.right);

  return targetElementPosition;
}

/**
 * Remove all children of the specified element
 * @param element Element where the children will be removed
 */
export function removeAllChildren(element: HTMLElement): void {
  if (!element) { return; }
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Creates the SVG Element based on the given content
 * @param svgContent SVG content to be created
 */
export function createSvgElement(svgContent: string): SVGElement {
  let div = document.createElement('DIV');
  div.innerHTML = svgContent;

  let svg = div.querySelector('svg') as SVGElement;
  if (!svg) { throw Error('<svg> tag not found'); }

  if (!svg.getAttribute('xmlns')) {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  svg.setAttribute('fit', '');
  svg.removeAttribute('id');
  svg.removeAttribute('title');
  svg.setAttribute('height', '100%');
  svg.setAttribute('width', '100%');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('focusable', 'false'); // Disable IE11 default behavior to make SVGs focusable.
  return svg;
}

/**
 * Returns true when the element is visible
 * @param element Element to be checked
 */
export function isElementVisible(element: HTMLElement): boolean {
  return !isNullOrEmpty(element) && !isNullOrEmpty(element.offsetParent);
}

/**
 * Copy text from element to clipboard
 * @param element element returned by #some-id
 */
export function copyToClipboard(element: any): void {
  element.select();
  element.setSelectionRange(0, 99999);
  document.execCommand('copy');
}
