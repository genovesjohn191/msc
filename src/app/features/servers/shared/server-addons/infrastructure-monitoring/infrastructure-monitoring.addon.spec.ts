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
import { InfrastructureMonitoringAddOnComponent } from './infrastructure-monitoring.addon';
import { CoreTestingModule } from '../../../../../core/testing';
import { OptionsApiService } from '../../../../services';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(InfrastructureMonitoringAddOnComponent)
  public infrastructureMonitoringAddOnComponent: InfrastructureMonitoringAddOnComponent;
}

describe('InfrastructureMonitoringAddOnComponent', () => {

  /** Stub Services/Components */
  let component: TestComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        InfrastructureMonitoringAddOnComponent
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
        <mcs-infrastructure-monitoring-addon></mcs-infrastructure-monitoring-addon>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.infrastructureMonitoringAddOnComponent.serviceLevels.push('Standard');
      component.infrastructureMonitoringAddOnComponent.serviceLevels.push('Premium');
    });
  }));

  /** Test Implementation */
  // TODO: Commented out since it is returning async process error
  // need further investigation for this one.
});
