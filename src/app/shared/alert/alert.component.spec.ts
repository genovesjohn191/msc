import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { CoreDefinition } from '@app/core';
import { CoreTestingModule } from '@app/core/testing';
import { AlertModule } from './alert.module';
import { AlertComponent } from './alert.component';

@Component({
  selector: 'mcs-test-alert',
  template: ``
})
export class TestAlertComponent {
  @ViewChild('alertSuccess')
  public alertSuccess: AlertComponent;

  @ViewChild('alertError')
  public alertError: AlertComponent;

  @ViewChild('alertWarning')
  public alertWarning: AlertComponent;

  @ViewChild('alertInfo')
  public alertInfo: AlertComponent;
}

describe('AlertComponent', () => {

  /** Stub Services/Components */
  let component: TestAlertComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestAlertComponent
      ],
      imports: [
        AlertModule,
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestAlertComponent, {
      set: {
        template: `
        <mcs-alert type="success" #alertSuccess>
          Sample success Alert
        </mcs-alert>

        <mcs-alert type="error" #alertError>
          Sample error Alert
        </mcs-alert>

        <mcs-alert type="warning" #alertWarning>
          Sample warning Alert
        </mcs-alert>

        <mcs-alert type="info" #alertInfo>
          Sample info Alert
        </mcs-alert>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestAlertComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-alert element`, () => {
      let element = document.querySelector('mcs-alert');
      expect(element).not.toBe(null);
    });
  });

  describe('getAlertIconKey()', () => {
    it(`should set the alert success icon color to green and the key icon`, () => {
      expect(component.alertSuccess.alertIconDetails.key)
        .toBe(CoreDefinition.ASSETS_FONT_CHECK_CIRCLE);
      expect(component.alertSuccess.alertIconDetails.iconColor).toBe('green');
    });

    it(`should set the alert error icon color to red and the key icon`, () => {
      expect(component.alertError.alertIconDetails.key)
        .toBe(CoreDefinition.ASSETS_FONT_CLOSE_CIRCLE);
      expect(component.alertError.alertIconDetails.iconColor).toBe('red');
    });

    it(`should set the alert warning icon color to red and the key icon`, () => {
      expect(component.alertWarning.alertIconDetails.key)
        .toBe(CoreDefinition.ASSETS_FONT_WARNING);
      expect(component.alertWarning.alertIconDetails.iconColor).toBe('red');
    });

    it(`should set the alert info icon color to green and the key icon`, () => {
      expect(component.alertInfo.alertIconDetails.key)
        .toBe(CoreDefinition.ASSETS_FONT_INFORMATION_CIRCLE);
      expect(component.alertInfo.alertIconDetails.iconColor).toBe('primary');
    });
  });
});
