import {
  async,
  TestBed
} from '@angular/core/testing';

import { WizardStepComponent } from './wizard-step.component';

describe('WizardStepComponent', () => {

  /** Stub Services/Components */
  let component: WizardStepComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        WizardStepComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(WizardStepComponent, {
      set: {
        template: `
          <div>WizardStepComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(WizardStepComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('constructor()', () => {
    it(`should set the tite to empty`, () => {
      expect(component.title).toBe('');
    });

    it(`should set the hidden to false`, () => {
      expect(component.title).toBeFalsy();
    });

    it(`should set the showNext to true`, () => {
      expect(component.showNext).toBeTruthy();
    });

    it(`should set the showPrevious to true`, () => {
      expect(component.showPrevious).toBeTruthy();
    });

    it(`should set the valid to true`, () => {
      expect(component.valid).toBeTruthy();
    });

    it(`should set the isActive to false`, () => {
      expect(component.isActive).toBeFalsy();
    });

    it(`should set the enabled to false`, () => {
      expect(component.enabled).toBeFalsy();
    });

    it(`should set the completed to false`, () => {
      expect(component.completed).toBeFalsy();
    });
  });
});
