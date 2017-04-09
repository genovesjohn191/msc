import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import {
  EventEmitter
} from '@angular/core';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  const filterText: string = 'text';

  /** Stub Services/Components */
  let component: CheckboxComponent;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        CheckboxComponent
      ],
      imports: [
      ],
      providers: [
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(CheckboxComponent, {
      set: {
        template: `<div>Overridden template here</div>`
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
      spyOn(component.onClick, 'emit');
      component.onClickEvent(null);
      expect(component.onClick.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('writeValue()', () => {
    it('should set the value of isChecked to true', () => {
      component.writeValue(true);
      expect(component.isChecked).toEqual(true);
    });
  });
});
