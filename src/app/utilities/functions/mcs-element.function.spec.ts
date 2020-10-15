import { waitForAsync } from '@angular/core/testing';

import {
  createSvgElement,
  getElementOffset,
  getElementPosition,
  getElementPositionFromHost,
  getElementStyle,
  getOffsetParent,
  isElementVisible,
  removeAllChildren
} from './mcs-element.function';

describe('McsElementFunction', () => {

  // Variable declarations
  let documentMargin = document.documentElement.style.margin;
  let bodyMargin = document.body.style.margin;
  let bodyHeight = document.body.style.height;
  let bodyWidth = document.body.style.width;
  let element: HTMLElement;

  // Create function pointer for the creation of element
  function createElement(
    height: number,
    width: number,
    marginTop: number,
    marginLeft: number
  ): HTMLElement {
    let createdElement = document.createElement('div');
    createdElement.style.display = 'inline-block';
    createdElement.style.height = height + 'px';
    createdElement.style.width = width + 'px';
    createdElement.style.marginTop = marginTop + 'px';
    createdElement.style.marginLeft = marginLeft + 'px';

    return createdElement;
  }

  beforeEach(waitForAsync(() => {
    // Cleanup body element
    let elementNodes = document.getElementsByTagName('body');
    for (let idxNode = 0; idxNode < elementNodes.length; idxNode++) {
      let node = elementNodes.item(idxNode);
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }

    // Creation of element
    element = createElement(200, 300, 100, 150);
    document.body.appendChild(element);

    // Reset document layout settings
    document.documentElement.style.margin = '0';
    document.body.style.margin = '0';
    document.body.style.height = '2000px';
    document.body.style.width = '2000px';
  }));

  afterEach(waitForAsync(() => {
    document.body.removeChild(element);
    document.documentElement.style.margin = documentMargin;
    document.body.style.margin = bodyMargin;
    document.body.style.height = bodyHeight;
    document.body.style.width = bodyWidth;
  }));

  describe('getElementStyle()', () => {
    it('should get the height of the element', () => {
      let style = getElementStyle(element, 'height');
      expect(style).toBe('200px');
    });

    it('should get the width of the element', () => {
      let style = getElementStyle(element, 'width');
      expect(style).toBe('300px');
    });
  });

  describe('getOffsetParent()', () => {
    it(`should get the nearest ancestor element
      that has a position other than static`, () => {
        let staticElement = createElement(100, 300, 100, 100);
        let absoluteElement = createElement(100, 400, 70, 75);
        let relativeElement = createElement(100, 500, 50, 75);

        staticElement.style.position = 'static';
        absoluteElement.style.position = 'absolute';
        relativeElement.style.position = 'relative';
        element.style.position = 'fixed';

        element.appendChild(absoluteElement);
        absoluteElement.appendChild(staticElement);
        staticElement.appendChild(relativeElement);

        let offsetParentElement = getOffsetParent(relativeElement);
        expect(offsetParentElement.style.position).toBe('absolute');

        element.style.position = '';
        element.removeChild(absoluteElement);
      });
  });

  describe('getElementOffset()', () => {
    it('should get the element offset', () => {
      let position = getElementOffset(element);

      expect(position.height).toBe(200);
      expect(position.width).toBe(300);
      expect(position.top).toBe(100);
      expect(position.bottom).toBe(300);
      expect(position.left).toBe(150);
      expect(position.right).toBe(450);
    });

    it('should get the element offset when scrolled', () => {
      document.documentElement.scrollTop = 1000;
      document.documentElement.scrollLeft = 1000;

      let position = getElementOffset(element);

      expect(position.height).toBe(200);
      expect(position.width).toBe(300);
      expect(position.top).toBe(100);
      expect(position.bottom).toBe(300);
      expect(position.left).toBe(150);
      expect(position.right).toBe(450);

      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    });
  });

  describe('getElementPosition()', () => {
    it('should get the element position', () => {
      let position = getElementPosition(element);

      expect(position.height).toBe(200);
      expect(position.width).toBe(300);
      expect(position.top).toBe(100);
      expect(position.bottom).toBe(300);
      expect(position.left).toBe(150);
      expect(position.right).toBe(450);
    });

    it('should get the element position when scrolled', () => {
      document.documentElement.scrollTop = 1000;
      document.documentElement.scrollLeft = 1000;

      let position = getElementPosition(element);

      expect(position.top).toBe(100);
      expect(position.bottom).toBe(300);
      expect(position.left).toBe(150);
      expect(position.right).toBe(450);

      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    });

    it('should get the element position on positioned ancestor', () => {
      let childElement = createElement(100, 150, 50, 75);

      element.style.position = 'relative';
      element.appendChild(childElement);

      let position = getElementPosition(childElement);

      expect(position.top).toBe(50);
      expect(position.bottom).toBe(150);
      expect(position.left).toBe(75);
      expect(position.right).toBe(225);

      element.style.position = '';
      element.removeChild(childElement);
    });
  });

  describe('getElementPositionFromHost()', () => {
    let hostElement: HTMLElement;
    let targetElement: HTMLElement;
    beforeEach(waitForAsync(() => {
      hostElement = element;
      targetElement = createElement(50, 100, 10, 20);
      document.body.appendChild(targetElement);
    }));

    it('should position the element top-left', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'top-left');

      expect(position.top).toBe(50);
      expect(position.left).toBe(150);
    });

    it('should position the element top-center', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'top');

      expect(position.top).toBe(50);
      expect(position.left).toBe(250);
    });

    it('should position the element top-right', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'top-right');

      expect(position.top).toBe(50);
      expect(position.left).toBe(450);
    });

    it('should position the element bottom-left', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'bottom-left');

      expect(position.top).toBe(300);
      expect(position.left).toBe(150);
    });

    it('should position the element bottom-center', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'bottom');

      expect(position.top).toBe(300);
      expect(position.left).toBe(250);
    });

    it('should position the element bottom-right', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'bottom-right');

      expect(position.top).toBe(300);
      expect(position.left).toBe(450);
    });

    it('should position the element left-top', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'left-top');

      expect(position.top).toBe(100);
      expect(position.left).toBe(50);
    });

    it('should position the element left-center', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'left');

      expect(position.top).toBe(175);
      expect(position.left).toBe(50);
    });

    it('should position the element left-bottom', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'left-bottom');

      expect(position.top).toBe(300);
      expect(position.left).toBe(50);
    });

    it('should position the element right-top', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'right-top');

      expect(position.top).toBe(100);
      expect(position.left).toBe(450);
    });

    it('should position the element right-center', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'right');

      expect(position.top).toBe(175);
      expect(position.left).toBe(450);
    });

    it('should position the element right-bottom', () => {
      let position = getElementPositionFromHost(hostElement, targetElement, 'right-bottom');

      expect(position.top).toBe(300);
      expect(position.left).toBe(450);
    });
  });

  describe('removeAllChildren()', () => {
    it('should remove all the children element of the specified element', () => {
      let parentElement = createElement(1, 1, 2, 3);
      let childElement1 = createElement(1, 1, 2, 3);
      let childElement2 = createElement(1, 1, 2, 3);
      parentElement.appendChild(childElement1);
      parentElement.appendChild(childElement2);
      expect(parentElement.children.length).toBe(2);
      removeAllChildren(parentElement);
      expect(parentElement.children.length).toBe(0);
    });
  });

  describe('createSvgElement()', () => {
    it('should create an SVG Element based on content provided', () => {
      let svgElement = createSvgElement(`<svg><title>SVG Title</title></svg>`);
      expect(svgElement).toBeDefined();
    });
  });

  describe('isElementVisible()', () => {
    it('should return true when the element is visible', () => {
      let visibleElement = createElement(200, 300, 100, 150);
      document.body.appendChild(visibleElement);
      expect(isElementVisible(visibleElement)).toBeTruthy();
    });

    it('should return false when the element is hidden', () => {
      let hiddenElement = createElement(200, 300, 100, 150);
      hiddenElement.style.display = 'none';
      document.body.appendChild(hiddenElement);
      expect(isElementVisible(hiddenElement)).toBeFalsy();
    });
  });
});
