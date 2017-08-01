import { registerEvent } from './mcs-events.function';

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
});
