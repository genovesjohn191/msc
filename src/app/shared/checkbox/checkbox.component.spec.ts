import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {

  /** Stub Services/Components */
  let component: CheckboxComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        CheckboxComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(CheckboxComponent, {
      set: {
        template: `<div>CheckboxComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(CheckboxComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('onClickEvent()', () => {
    it('should call the emit() of EventEmitter', () => {
      spyOn(component.statusChange, 'emit');
      component.onClickEvent(new MouseEvent('click'));
      expect(component.statusChange.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('writeValue()', () => {
    it('should set the value of checked to true', () => {
      component.writeValue(true);
      expect(component.checked).toEqual(true);
    });
  });
});
