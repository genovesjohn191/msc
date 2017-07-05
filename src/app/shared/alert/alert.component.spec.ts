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
          <div>
            Overridden template here
          </div>
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
      expect(component.getAlertIconKey()).toBe(CoreDefinition.ASSETS_FONT_CLOSE);
    });

    it('should return the warning icon key definition in case of warning', () => {
      component.type = 'warning';
      expect(component.getAlertIconKey()).toBe(CoreDefinition.ASSETS_FONT_WARNING);
    });

    it('should return the information-2 icon key definition in case of info', () => {
      component.type = 'info';
      expect(component.getAlertIconKey()).toBe(CoreDefinition.ASSETS_FONT_INFORMATION_2);
    });

    it('should return the check icon key definition in case of success', () => {
      component.type = 'success';
      expect(component.getAlertIconKey()).toBe(CoreDefinition.ASSETS_FONT_CHECK);
    });
  });
});
