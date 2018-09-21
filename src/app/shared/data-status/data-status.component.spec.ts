import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { McsDataStatusFactory } from '@app/core';
import { CoreTestingModule } from '@app/core/testing';
import { DataStatusComponent } from './data-status.component';
import { DataStatusModule } from './data-status.module';

@Component({
  selector: 'mcs-data-status-item',
  template: ``
})
export class TestDataStatusComponent {
  @ViewChild(DataStatusComponent)
  public dataStatusComponent: DataStatusComponent;
  public dataStatus = new McsDataStatusFactory<any>();
}

describe('DataStatusComponent', () => {

  let fixture: ComponentFixture<TestDataStatusComponent>;
  let component: TestDataStatusComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestDataStatusComponent
      ],
      imports: [
        CoreTestingModule,
        DataStatusModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestDataStatusComponent, {
      set: {
        template: `
        <mcs-data-status [dataStatusFactory]="dataStatus">
          <mcs-data-status-in-progress mcsDataInProgress>
            <span>Obtaining data</span>
          </mcs-data-status-in-progress>

          <mcs-data-status-success mcsDataSuccess>
            <span>Success messages</span>
          </mcs-data-status-success>

          <mcs-data-status-empty mcsDataEmpty>
            <span>Empty data</span>
          </mcs-data-status-empty>

          <mcs-data-status-error mcsDataError>
            <span>Error messages</span>
          </mcs-data-status-error>
        </mcs-data-status>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TestDataStatusComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-data-status element`, () => {
      let element = document.querySelector('mcs-data-status');
      expect(element).not.toBe(null);
    });

    it(`should create the mcs-data-status-in-progress element`, () => {
      component.dataStatus.setInProgress();
      fixture.autoDetectChanges(true);
      let element = document.querySelector('mcs-data-status-in-progress');
      expect(element).not.toBe(null);
    });

    it(`should create the mcs-data-status-error element in case of error`, () => {
      component.dataStatus.setError();
      fixture.autoDetectChanges(true);
      let element = document.querySelector('mcs-data-status-error');
      expect(element).not.toBe(null);
    });

    it(`should create the mcs-data-status-empty element in case of no records`, () => {
      component.dataStatus.setSuccessful();
      fixture.autoDetectChanges(true);
      let element = document.querySelector('mcs-data-status-empty');
      expect(element).not.toBe(null);
    });

    it(`should create the mcs-data-status-success element in case of no records`, () => {
      component.dataStatus.setSuccessful(['test']);
      fixture.autoDetectChanges(true);
      let element = document.querySelector('mcs-data-status-success');
      expect(element).not.toBe(null);
    });
  });
});
