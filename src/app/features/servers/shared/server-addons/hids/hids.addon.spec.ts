import {
  Component,
  ViewChild
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { SharedModule } from '../../../../../shared';
import { HidsAddOnComponent } from './hids.addon';
import { CoreTestingModule } from '../../../../../core/testing';
import { OptionsApiService } from '../../../../services';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(HidsAddOnComponent)
  public hidsAddOnComponent: HidsAddOnComponent;
}

describe('DisasterRecoveryAddOnComponent', () => {

  /** Stub Services/Components */
  let component: TestComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        HidsAddOnComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        CoreTestingModule,
        SharedModule
      ],
      providers: [
        OptionsApiService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <mcs-hids-addon></mcs-hids-addon>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.hidsAddOnComponent.hidsServiceVariants.push('Standard');
      component.hidsAddOnComponent.hidsProtectionLevels.push('Detect');
      component.hidsAddOnComponent.hidsPolicyTemplates.push('LAMP');
    });
  }));

  /** Test Implementation */
  // TODO: Needs to update unit test once the component
  // was updated and using the data from the api
  describe('onServiceVariantChanged()', () => {
    it(`should output the selected value from select field`, () => {
        spyOn(component.hidsAddOnComponent.change, 'emit');
        component.hidsAddOnComponent.onServiceVariantChanged();
        expect(component.hidsAddOnComponent.change.emit).toHaveBeenCalledTimes(1);
      });
  });

  describe('onProtectionLevelChanged()', () => {
    it(`should output the selected value from select field`, () => {
        spyOn(component.hidsAddOnComponent.change, 'emit');
        component.hidsAddOnComponent.onProtectionLevelChanged();
        expect(component.hidsAddOnComponent.change.emit).toHaveBeenCalledTimes(1);
      });
  });

  describe('onPolicyTemplateChanged()', () => {
    it(`should output the selected value from select field`, () => {
        spyOn(component.hidsAddOnComponent.change, 'emit');
        component.hidsAddOnComponent.onPolicyTemplateChanged();
        expect(component.hidsAddOnComponent.change.emit).toHaveBeenCalledTimes(1);
      });
  });
});
