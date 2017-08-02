import {
  async,
  TestBed
} from '@angular/core/testing';
import { WizardComponent } from './wizard.component';
import { WizardStepComponent } from './wizard-step/wizard-step.component';
import { CoreTestingModule } from '../../core/testing';

describe('WizardComponent', () => {

  /** Stub Services/Components */
  let component: WizardComponent;
  let firstStep: WizardStepComponent;
  let secondStep: WizardStepComponent;
  let secondSecretStep: WizardStepComponent;
  let thirdStep: WizardStepComponent;
  let fourthStep: WizardStepComponent;

  let createStep = (title: string, hiddenFlag: boolean) => {
    let step = new WizardStepComponent();
    step.completed = false;
    step.enabled = false;
    step.isActive = false;
    step.showNext = true;
    step.showPrevious = true;
    step.stepTitle = title;
    step.hidden = hiddenFlag;

    return step;
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        WizardComponent
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(WizardComponent, {
      set: {
        template: `
          <div>WizardComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(WizardComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;

      /** Populate Inputs */
      firstStep = createStep('First', false);
      secondStep = createStep('Second', false);
      secondSecretStep = createStep('Secret', true);
      thirdStep = createStep('Third', false);
      fourthStep = createStep('Fourth', false);

      component.steps.push(firstStep);
      component.steps.push(secondStep);
      component.steps.push(secondSecretStep);
      component.steps.push(thirdStep);
      component.steps.push(fourthStep);
      component.setActiveStep(secondStep);
    });
  }));

  /** Test Implementation */
  describe('hasNextStep()', () => {
    it(`should get true from hasNextStep variable
    when the active step is in the middle`, () => {
        component.setActiveStep(secondStep);
        expect(component.hasNextStep).toBeTruthy();
      });

    it(`should get false from hasNextStep variable
    when the active step is 2nd to the last record`, () => {
        component.setActiveStep(thirdStep);
        expect(component.hasNextStep).toBeFalsy();
      });

    it(`should get false from hasNextStep variable
    when the active step is the last record (Completed)`, () => {
        component.setActiveStep(thirdStep);
        component.onClickCompleted();
        expect(component.hasNextStep).toBeFalsy();
      });
  });

  describe('hasPreviousStep()', () => {
    it(`should get true from hasPreviousStep variable
    when the active step is in the middle`, () => {
        component.setActiveStep(secondStep);
        expect(component.hasPreviousStep).toBeTruthy();
      });

    it(`should get false from hasPreviousStep variable
    when the active step is first record`, () => {
        component.setActiveStep(firstStep);
        expect(component.hasPreviousStep).toBeFalsy();
      });

    it(`should get false from hasPreviousStep variable
    when the active step is the last record (Completed)`, () => {
        component.setActiveStep(thirdStep);
        component.onClickCompleted();
        expect(component.hasPreviousStep).toBeFalsy();
      });
  });

  describe('enableCancel()', () => {
    it(`should get true from enableCancel variable
    when the active step is the first`, () => {
        component.setActiveStep(firstStep);
        expect(component.enableCancel).toBeTruthy();
      });

    it(`should get false from enableCancel variable
    when the active step is not first record`, () => {
        component.setActiveStep(secondStep);
        expect(component.enableCancel).toBeFalsy();
      });
  });

  describe('enableCompletedStep()', () => {
    it(`should get true from enableCompletedStep variable
    when the active step is 2nd to last record`, () => {
        component.setActiveStep(thirdStep);
        expect(component.enableCompletedStep).toBeTruthy();
      });

    it(`should get false from enableCompletedStep variable
    when the active step is not 2nd to the last`, () => {
        component.setActiveStep(secondStep);
        expect(component.enableCompletedStep).toBeFalsy();
      });
  });

  describe('cancelTextContent()', () => {
    it(`should get the inputted cancelText if inputted`, () => {
      component.cancelText = 'cancel';
      expect(component.cancelTextContent).toBe(component.cancelText);
    });

    it(`should get the textcontent of cancel text if
    there are no inputted cancelText`, () => {
        expect(component.cancelTextContent).not.toBe(component.cancelText);
      });
  });

  describe('completedTextContent()', () => {
    it(`should get the inputted completedTextContent if inputted`, () => {
      component.completedText = 'completed';
      expect(component.completedTextContent).toBe(component.completedText);
    });

    it(`should get the textcontent of cancel text if
    there are no inputted completedText`, () => {
        expect(component.completedTextContent).not.toBe(component.completedText);
      });
  });

  describe('onClickCancel()', () => {
    it(`should emit the onCancel event`, () => {
      spyOn(component.onCancel, 'emit');
      component.onClickCancel();
      expect(component.onCancel.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('onClickNext()', () => {
    beforeEach(async(() => {
      component.setActiveStep(secondStep);
      component.onClickNext();
    }));

    it(`should set the previous active step to completed`, () => {
      expect(component.displayedSteps[1].completed).toBeTruthy();
    });

    it(`should set the next displayed step record as active step`, () => {
      expect(component.activeStep).toBe(thirdStep);
    });

    it(`should set the secret step as next record and active step`, () => {
      component.steps[2].hidden = false;
      component.setActiveStep(secondStep);
      component.onClickNext();
      expect(component.activeStep).toBe(secondSecretStep);
    });
  });

  describe('onClickPrevious()', () => {
    beforeEach(async(() => {
      component.setActiveStep(secondStep);
      component.onClickPrevious();
    }));

    it(`should set the previous record as active step`, () => {
      expect(component.activeStep).toBe(firstStep);
    });
  });

  describe('onComplete()', () => {
    beforeEach(async(() => {
      component.setActiveStep(thirdStep);
      spyOn(component.onComplete, 'emit');
      component.onClickCompleted();
    }));

    it(`should call the onComplete emit`, () => {
      expect(component.onComplete.emit).toHaveBeenCalledTimes(1);
    });

    it(`should set the previous active step to completed`, () => {
      expect(component.displayedSteps[2].completed).toBeTruthy();
    });

    it(`should set the next record as active step`, () => {
      expect(component.activeStep).toBe(fourthStep);
    });
  });

  describe('goToStep()', () => {
    it(`should to the inputted step`, () => {
      thirdStep.enabled = true;
      component.goToStep(thirdStep);
      expect(component.activeStep).toBe(thirdStep);
    });
  });

  describe('setActiveStep()', () => {
    beforeEach(async(() => {
      // Previous selection
      component.setActiveStep(thirdStep);

      spyOn(component.onStepChanged, 'emit');
      component.setActiveStep(fourthStep);
    }));

    it(`should set the previous step to inactive`, () => {
      expect(thirdStep.isActive).toBeFalsy();
    });

    it(`should set the new step to active`, () => {
      expect(fourthStep.isActive).toBeTruthy();
    });

    it(`should set the new step to enable`, () => {
      expect(fourthStep.enabled).toBeTruthy();
    });

    it(`should set the activeStepIndex to the index of the active step`, () => {
      expect(component.activeStepIndex).toBe(component.displayedSteps
        .indexOf(component.activeStep));
    });

    it(`should call the emit of onStepChanged`, () => {
      expect(component.onStepChanged.emit).toHaveBeenCalledTimes(1);
    });
  });
});
