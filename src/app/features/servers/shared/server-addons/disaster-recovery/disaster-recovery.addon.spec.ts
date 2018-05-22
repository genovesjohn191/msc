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
import { DisasterRecoveryAddOnComponent } from './disaster-recovery.addon';
import { CoreTestingModule } from '../../../../../core/testing';
import { OptionsApiService } from '../../../../services';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(DisasterRecoveryAddOnComponent)
  public disasterRecoveryAddOnComponent: DisasterRecoveryAddOnComponent;
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
        DisasterRecoveryAddOnComponent
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
        <mcs-disaster-recovery-addon></mcs-disaster-recovery-addon>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.disasterRecoveryAddOnComponent.protectionGroups.push('Contoso MMAZG00001');
    });
  }));

  /** Test Implementation */
  // TODO: Commented out since it is returning async process error
  // need further investigation for this one.
});
