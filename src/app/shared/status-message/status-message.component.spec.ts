import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { CommonDefinition } from '@app/utilities';

import { StatusMessageComponent } from './status-message.component';

describe('StatusMessageComponent', () => {

  /** Stub Services/Components */
  let component: StatusMessageComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        StatusMessageComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(StatusMessageComponent, {
      set: {
        template: `
          <div>StatusMessageComponent Template</div>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(StatusMessageComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should set the status icon key when the message type is success`, () => {
      component.type = 'success';

      expect(component.statusIconKey)
        .toBe(CommonDefinition.ASSETS_SVG_SUCCESS);
    });

    it(`should set the status icon key when the message type is error`, () => {
      component.type = 'error';

      expect(component.statusIconKey)
        .toBe(CommonDefinition.ASSETS_SVG_ERROR);
    });

    it(`should set the status icon key when the message type is warning`, () => {
      component.type = 'warning';

      expect(component.statusIconKey)
        .toBe(CommonDefinition.ASSETS_SVG_WARNING);
    });

    it(`should set the status icon key when the message type is info`, () => {
      component.type = 'info';

      expect(component.statusIconKey)
        .toBe(CommonDefinition.ASSETS_SVG_INFO);
    });
  });
});
