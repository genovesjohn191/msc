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

  public onSelectInfrastructureServiceLevel($event): any {
    return $event;
  }
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
        <mcs-infrastructure-monitoring
          (change)="onSelectInfrastructureServiceLevel($event)">
        </mcs-infrastructure-monitoring>
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
  // TODO: Needs to update unit test once the component
  // was updated and using the data from the api
  describe('onServiceLevelChanged()', () => {
    it(`should output the selected value from select field`, () => {
        spyOn(component.infrastructureMonitoringAddOnComponent.change, 'emit');
        component.infrastructureMonitoringAddOnComponent.onServiceLevelChanged();
        expect(component.infrastructureMonitoringAddOnComponent.change.emit)
          .toHaveBeenCalledTimes(1);
        expect(component.onSelectInfrastructureServiceLevel('Standard')).toBeDefined();
      });
  });
});
