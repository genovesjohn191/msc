import {
  registerEvent,
  unregisterEvent
} from './mcs-events.function';

describe('EVENTS Utility Functions', () => {
  describe('registerEvent()', () => {
    it(`should register the event and call the listen of angular renderer`, () => {
      let mockRenderer = { listen(element: any, event: any, callback: any) { return; } };
      let mockCallback = () => {
        return undefined;
      };

      spyOn(mockRenderer, 'listen');
      registerEvent(mockRenderer, document.createElement('div'), 'click', mockCallback);
      expect(mockRenderer.listen).toHaveBeenCalledTimes(1);
    });
  });

  describe('unregisterEvent()', () => {
    it(`should unregister the event and call the removeEventListener`, () => {
      let mockElement = { removeEventListener(event: any, callback: any) { return; } };
      let mockCallback = () => {
        return undefined;
      };

      spyOn(mockElement, 'removeEventListener');
      unregisterEvent(mockElement, 'click', mockCallback);
      expect(mockElement.removeEventListener).toHaveBeenCalledTimes(1);
    });
  });
});
