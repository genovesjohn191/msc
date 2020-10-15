import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';

import { WizardComponent } from './wizard.component';
import { WizardModule } from './wizard.module';

@Component({
  selector: 'mcs-wizard-test',
  template: ``
})
export class TestWizardComponent {
  @ViewChild(WizardComponent, { static: false })
  public wizardComponent: WizardComponent;
}

describe('WizardComponent', () => {

  /** Stub Services/Components */
  let component: TestWizardComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestWizardComponent
      ],
      imports: [
        WizardModule,
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestWizardComponent, {
      set: {
        template: `
          <mcs-wizard>
            <mcs-wizard-step stepTitle="First Step" id="1">
              <h2>First Header</h2>
            </mcs-wizard-step>
            <mcs-wizard-step stepTitle="Second Step" id="2">
              <h2>Second Header</h2>
            </mcs-wizard-step>
            <mcs-wizard-step stepTitle="Third Step" id="3">
              <h2>Third Header</h2>
            </mcs-wizard-step>
          </mcs-wizard>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestWizardComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.wizardComponent.ngAfterContentInit();
    });
  }));

  /** Test Implementation */
  describe('ngAfterContentInit()', () => {
    it(`should create the mcs-wizard element`, () => {
      let element: any;
      element = document.querySelector('mcs-wizard');
      expect(element).not.toBe(null);
    });
  });

  describe('next()', () => {
    it(`should set the wizard step to next step`, () => {
      component.wizardComponent.next();
      expect(component.wizardComponent.activeStep.id).toBe('2');
    });

    it(`should call the stepsCompleted method when it reached the final step`, () => {
      spyOn(component.wizardComponent, 'stepsCompleted');
      component.wizardComponent.next();
      component.wizardComponent.next();
      expect(component.wizardComponent.stepsCompleted).toHaveBeenCalledTimes(1);
    });
  });

  describe('previous()', () => {
    it(`should set the wizard step to previous step`, () => {
      component.wizardComponent.next();
      component.wizardComponent.previous();
      expect(component.wizardComponent.activeStep.id).toBe('1');
    });
  });

  describe('previous()', () => {
    it(`should set the isCompleted flag to true`, () => {
      component.wizardComponent.stepsCompleted();
      expect(component.wizardComponent.isCompleted).toBeTruthy();
    });

    it(`should emit the completed event`, () => {
      spyOn(component.wizardComponent.completed, 'emit');
      component.wizardComponent.stepsCompleted();
      expect(component.wizardComponent.completed.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('moveStepTo()', () => {
    it(`should set inputted step as active step when that step is already finished`, () => {
      let targetStep = component.wizardComponent.steps[1];
      component.wizardComponent.next();
      component.wizardComponent.moveStepTo(targetStep);
      expect(component.wizardComponent.activeStep).toEqual(targetStep);
    });

    it(`should not set inputted step as active step when that step is not yet finished`, () => {
      let targetStep = component.wizardComponent.steps[2];
      component.wizardComponent.moveStepTo(targetStep);
      expect(component.wizardComponent.activeStep).not.toEqual(targetStep);
    });
  });
});
