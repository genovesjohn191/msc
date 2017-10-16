import {
  Component,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { triggerEvent } from '../../utilities';
import { SelectComponent } from './select.component';
import { SelectModule } from './select.module';
import { CoreTestingModule } from '../../core/testing';

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

  beforeEach(async(() => {
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
          <mcs-select-group header="Group header">
            <mcs-select-item *ngFor="let food of foods" [value]="food.value">
              {{ food.viewValue }}
            </mcs-select-item>
          </mcs-select-group>
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
    beforeEach(async(() => {
      component.selectComponent.modelValue = 'pizza-1';
    }));

    it(`should set the modelValue to selectedValue of model binding`, () => {
      expect(component.selectedValue).toEqual(component.selectComponent.modelValue);
    });
  });

  describe('openPanel()', () => {
    beforeEach(async(() => {
      component.selectComponent.openPanel();
    }));

    it(`should open the panel`, () => {
      expect(component.selectComponent.panelOpen).toBeTruthy();
    });

    it(`should create the mcs-select-group element`, () => {
      let element = document.querySelectorAll('mcs-select-group');
      expect(element).not.toBe(null);
    });

    it(`should create the mcs-select-item element`, () => {
      let element = document.querySelectorAll('mcs-select-item');
      expect(element).not.toBe(null);
    });
  });

  describe('closePanel()', () => {
    beforeEach(async(() => {
      component.selectComponent.closePanel();
    }));

    it(`should close the panel`, () => {
      expect(component.selectComponent.panelOpen).toBeFalsy();
    });

    it(`should remove all the mcs-select-group element`, () => {
      let element = document.querySelectorAll('mcs-select-group');
      expect(element.length).toBe(0);
    });

    it(`should remove all the mcs-select-item element`, () => {
      let element = document.querySelectorAll('mcs-select-item');
      expect(element.length).toBe(0);
    });
  });

  describe('_onCloseOutside()', () => {
    it(`should close the select panel`, () => {
      triggerEvent(document, 'click');
      expect(component.selectComponent.panelOpen).toBeFalsy();
    });
  });
});
