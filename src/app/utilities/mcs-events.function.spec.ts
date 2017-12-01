import {
  registerEvent,
  unregisterEvent,
  triggerEvent,
  createMouseEvent,
  createKeyboardEvent
} from './mcs-events.function';

describe('EVENTS Utility Functions', () => {
  describe('registerEvent()', () => {
    it(`should register the event and call the removeEventListenerr`, () => {
      let mockElement = { addEventListener(_event: any, _callback: any) { return; } };
      let mockCallback = () => {
        return undefined;
      };

      spyOn(mockElement, 'addEventListener');
      registerEvent(mockElement, 'click', mockCallback);
      expect(mockElement.addEventListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('unregisterEvent()', () => {
    it(`should unregister the event and call the removeEventListener`, () => {
      let mockElement = { removeEventListener(_event: any, _callback: any) { return; } };
      let mockCallback = () => {
        return undefined;
      };

      spyOn(mockElement, 'removeEventListener');
      unregisterEvent(mockElement, 'click', mockCallback);
      expect(mockElement.removeEventListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('triggerEvent()', () => {
    it(`should trigger the event and call the removeEventListener`, () => {
      let mockElement = { dispatchEvent(_event: any) { return; } };

      spyOn(mockElement, 'dispatchEvent');
      triggerEvent(mockElement, 'click');
      expect(mockElement.dispatchEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('createMouseEvent()', () => {
    it(`should create the mouse event`, () => {
      let event = createMouseEvent('click', 10, 5);
      expect(event).toBeDefined();
    });
  });

  describe('createKeyboardEvent()', () => {
    it(`should create the keyboard event`, () => {
      let event = createKeyboardEvent(1);
      expect(event).toBeDefined();
    });
  });
});
