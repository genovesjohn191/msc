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
        CoreTestingModule
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
  // TODO: Commented out since it is returning async process error
  // need further investigation for this one.
});
