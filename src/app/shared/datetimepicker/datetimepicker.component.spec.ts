import {
  Component,
  ViewChild,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
FormsModule } from '@angular/forms';
import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';
import { DateTimePickerComponent } from './datetimepicker.component';
import { DateTimePickerModule } from './datetimepicker.module';

@Component({
  selector: 'mcs-test-datetimepicker',
  template: ``
})
export class TestDateTimePickerComponent implements OnInit {
  @ViewChild(DateTimePickerComponent, { static: false })
  public testCalendar: DateTimePickerComponent;
  public ngOnInit(): void {
  }
}

describe('CalendarComponent', () => {

  /** Stub Services/Components */
  let component: TestDateTimePickerComponent;
  let fixtureInstance: ComponentFixture<TestDateTimePickerComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [TestDateTimePickerComponent],
      imports: [
        CoreTestingModule,
        FormsModule,
        CommonModule,
        DateTimePickerModule,
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestDateTimePickerComponent, {
      set: {
        template: `
            <mcs-datetimepicker>
            </mcs-datetimepicker>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestDateTimePickerComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit', () => {

    it(`should create the mcs-datetimepicker element`, () => {
      let element: any;
      element = document.querySelector('mcs-datetimepicker');
      expect(element).not.toBe(null);
    });

  });
});
