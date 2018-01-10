import {
  Component,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { RadioButtonGroupComponent } from './radio-button-group.component';
import { RadioButtonGroupModule } from './radio-button-group.module';
import { CoreTestingModule } from '../../core/testing';

@Component({
  selector: 'mcs-test-radio-button-group',
  template: ``
})
export class TestRadioButtonGroupComponent {
  @ViewChild(RadioButtonGroupComponent)
  public radioButtonGroupComponent: RadioButtonGroupComponent;

  public modelValue: any;
}

describe('RadioButtonGroupComponent', () => {

  /** Stub Services/Components */
  let component: TestRadioButtonGroupComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestRadioButtonGroupComponent
      ],
      imports: [
        FormsModule,
        CoreTestingModule,
        RadioButtonGroupModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestRadioButtonGroupComponent, {
      set: {
        template: `
        <mcs-radio-button-group [(ngModel)]="modelValue">
          <mcs-radio-button value="value1">Value 1</mcs-radio-button>
          <mcs-radio-button value="value2">Value 2</mcs-radio-button>
        </mcs-radio-button-group>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestRadioButtonGroupComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.radioButtonGroupComponent.ngAfterContentInit();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the radio button group element`, () => {
      let element = document.querySelector('mcs-radio-button-group');
      expect(element).not.toBe(null);
    });

    it(`should create the radio button elements`, () => {
      let element = document.querySelectorAll('mcs-radio-button');
      expect(element).not.toBe(null);
      expect(element.length).toBe(2);
    });

    it(`should set the radio button group value to first radio button`, () => {
      expect(component.modelValue).toBe('value1');
    });
  });
});
