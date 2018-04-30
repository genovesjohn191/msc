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
import { SqlServerAddOnComponent } from './sql-server.addon';
import { CoreTestingModule } from '../../../../../core/testing';
import { OptionsApiService } from '../../../../services';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(SqlServerAddOnComponent)
  public sqlServerAddOnComponent: SqlServerAddOnComponent;
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
        SqlServerAddOnComponent
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
        <mcs-sql-server-addon></mcs-sql-server-addon>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.sqlServerAddOnComponent.sqlServerVersions.push('2008 SP4');
      component.sqlServerAddOnComponent.sqlServerEditions.push('Web');
      component.sqlServerAddOnComponent.sqlServerArchitectures.push('x64');
    });
  }));

  /** Test Implementation */
  // TODO: Commented out since it is returning async process error
  // need further investigation for this one.
});
