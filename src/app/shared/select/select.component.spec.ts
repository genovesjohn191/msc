import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CoreTestingModule } from '@app/core/testing';
import { triggerEvent } from '@app/utilities';

import { SelectComponent } from './select.component';
import { SelectModule } from './select.module';

@Component({
  selector: 'mcs-test-select',
  template: ``
})
export class TestSelectComponent {
  @ViewChild(SelectComponent)
  public selectComponent: SelectComponent;

  public selectedValue: any;
  public foods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' }
  ];
}

describe('SelectComponent', () => {

  /** Stub Services/Components */
  let component: TestSelectComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestSelectComponent
      ],
      imports: [
        FormsModule,
        CoreTestingModule,
        SelectModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestSelectComponent, {
      set: {
        template: `
        <mcs-select [(ngModel)]="selectedValue" placeholder="placeholder">
          <mcs-option-group header="Group header">
            <mcs-option *ngFor="let food of foods" [value]="food.value">
              {{ food.viewValue }}
            </mcs-option>
          </mcs-option-group>
        </mcs-select>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestSelectComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-select element`, () => {
      let element: any;
      element = document.querySelector('mcs-select');
      expect(element).not.toBe(null);
    });

    it(`should set the placeholder to input`, () => {
      expect(component.selectComponent.placeholder).toBe('placeholder');
    });
  });

  describe('modelValue()', () => {
    beforeEach(waitForAsync(() => {
      component.selectComponent.value = 'pizza-1';
    }));

    it(`should set the modelValue to selectedValue of model binding`, () => {
      expect(component.selectedValue).toEqual(component.selectComponent.value);
    });
  });

  describe('openPanel()', () => {
    beforeEach(waitForAsync(() => {
      component.selectComponent.openPanel();
    }));

    it(`should open the panel`, () => {
      expect(component.selectComponent.panelOpen).toBeTruthy();
    });
  });

  describe('closePanel()', () => {
    beforeEach(waitForAsync(() => {
      component.selectComponent.closePanel();
    }));

    it(`should close the panel`, () => {
      expect(component.selectComponent.panelOpen).toBeFalsy();
    });
  });

  describe('_onCloseOutside()', () => {
    it(`should close the select panel`, () => {
      triggerEvent(document, 'click');
      expect(component.selectComponent.panelOpen).toBeFalsy();
    });
  });
});
