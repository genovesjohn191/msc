import {
  fakeAsync,
  tick
} from '@angular/core/testing';
import { refreshView } from './mcs-angular.function';

// Dummy class
export class TestStructure {
  public executeProcess(): void {
    // Do something
  }
}

describe('ANGULAR Utility Functions', () => {
  describe('refreshView()', () => {
    it(`should refresh the view at the given time`, fakeAsync(() => {
      let testClass: TestStructure = new TestStructure();

      spyOn(testClass, 'executeProcess');
      refreshView(testClass.executeProcess, 1000);
      tick(1000);
      expect(testClass.executeProcess).toHaveBeenCalledTimes(1);
    }));
  });
});
