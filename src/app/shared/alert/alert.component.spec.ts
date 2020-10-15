import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';
import { CommonDefinition } from '@app/utilities';

import { AlertComponent } from './alert.component';
import { AlertModule } from './alert.module';

@Component({
  selector: 'mcs-test-alert',
  template: ``
})
export class TestAlertComponent {
  @ViewChild('alertSuccess', { static: false })
  public alertSuccess: AlertComponent;

  @ViewChild('alertError', { static: false })
  public alertError: AlertComponent;

  @ViewChild('alertWarning', { static: false })
  public alertWarning: AlertComponent;

  @ViewChild('alertInfo', { static: false })
  public alertInfo: AlertComponent;
}

describe('AlertComponent', () => {

  /** Stub Services/Components */
  let component: TestAlertComponent;

  beforeEach(waitForAsync(() => {
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
    it(`should set the success icon when the alert type is success`, () => {
      expect(component.alertSuccess.iconStatusKey)
        .toBe(CommonDefinition.ASSETS_SVG_SUCCESS);
    });

    it(`should set the error icon when the alert type is error`, () => {
      expect(component.alertError.iconStatusKey)
        .toBe(CommonDefinition.ASSETS_SVG_ERROR);
    });

    it(`should set the warning icon when the alert type is warning`, () => {
      expect(component.alertWarning.iconStatusKey)
        .toBe(CommonDefinition.ASSETS_SVG_WARNING);
    });

    it(`should set the info icon when the alert type is info`, () => {
      expect(component.alertInfo.iconStatusKey)
        .toBe(CommonDefinition.ASSETS_SVG_INFO);
    });
  });
});
