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

  public onSelectDisasterRecoveryGroup($event): any {
    return $event;
  }
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
        <mcs-disaster-recovery
          (change)="onSelectDisasterRecoveryGroup($event)">
        </mcs-disaster-recovery>
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
  // TODO: Needs to update unit test once the component
  // was updated and using the data from the api
  describe('onChanged()', () => {
    it(`should output the selected value from select field`, () => {
        spyOn(component.disasterRecoveryAddOnComponent.change, 'emit');
        component.disasterRecoveryAddOnComponent.onGroupChanged();
        expect(component.disasterRecoveryAddOnComponent.change.emit).toHaveBeenCalledTimes(1);
        expect(component.onSelectDisasterRecoveryGroup('Contoso MMAZG00001')).toBeDefined();
      });
  });
});
