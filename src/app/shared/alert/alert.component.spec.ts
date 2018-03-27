import {
  async,
  TestBed
} from '@angular/core/testing';

import { AlertComponent } from './alert.component';
import { CoreDefinition } from '../../core';

describe('AlertComponent', () => {

  /** Stub Services/Components */
  let component: AlertComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        AlertComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(AlertComponent, {
      set: {
        template: `
          <div>AlertComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(AlertComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  describe('getAlertIconKey()', () => {
    it('should return the close icon key definition in case of failed', () => {
      component.type = 'failed';
      expect(component.alertIconDetails.key).toBe(CoreDefinition.ASSETS_FONT_CLOSE_CIRCLE);
    });

    it('should return the warning icon key definition in case of warning', () => {
      component.type = 'warning';
      expect(component.alertIconDetails.key).toBe(CoreDefinition.ASSETS_FONT_WARNING);
    });

    it('should return the information-2 icon key definition in case of info', () => {
      component.type = 'info';
      expect(component.alertIconDetails.key).toBe(CoreDefinition.ASSETS_FONT_INFORMATION_CIRCLE);
    });

    it('should return the check icon key definition in case of success', () => {
      component.type = 'success';
      expect(component.alertIconDetails.key).toBe(CoreDefinition.ASSETS_FONT_CHECK_CIRCLE);
    });
  });
});
