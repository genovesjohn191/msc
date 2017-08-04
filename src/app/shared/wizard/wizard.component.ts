import {
  Component,
  AfterContentInit,
  ContentChildren,
  QueryList,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../core';
import { WizardStepComponent } from './wizard-step/wizard-step.component';
import { animateFactory } from '../../utilities';

@Component({
  selector: 'mcs-wizard',
  templateUrl: './wizard.component.html',
  styles: [require('./wizard.component.scss')],
  animations: [
    animateFactory({ duration: '300ms', easing: 'ease-in-out' })
  ]
})

export class WizardComponent implements AfterContentInit {
  @Input()
  public cancelText: string;

  @Input()
  public completedText: string;

  @Output()
  public onStepChanged: EventEmitter<WizardStepComponent>;

  @Output()
  public onCancel: EventEmitter<any>;

  @Output()
  public onComplete: EventEmitter<any>;

  @ContentChildren(WizardStepComponent)
  public wizardSteps: QueryList<WizardStepComponent>;

  public wizardTextContent: any;
  public activeStep: WizardStepComponent;
  public activeStepIndex: number;
  public isCompleted: boolean;

  // This is the list of all the steps in the wizard
  // including the hidden steps. If you want to get the
  // displayed steps only, use the displayedSteps variable instead
  public steps: WizardStepComponent[];

  public constructor(private _textContentProvider: McsTextContentProvider) {
    this.isCompleted = false;
    this.steps = new Array();
    this.activeStep = new WizardStepComponent();
    this.onStepChanged = new EventEmitter<WizardStepComponent>();
    this.onCancel = new EventEmitter<any>();
    this.onComplete = new EventEmitter<any>();
  }

  public get displayedSteps(): WizardStepComponent[] {
    return this.steps.filter((step) => !step.hidden);
  }

  public get hasNextStep(): boolean {
    return this.activeStepIndex < this.displayedSteps.length - 2 &&
      this.activeStep.showNext &&
      !this.isCompleted;
  }

  public get hasPreviousStep(): boolean {
    return this.activeStepIndex > 0 &&
      this.activeStep.showPrevious &&
      !this.isCompleted;
  }

  public get enableCancel(): boolean {
    return this.activeStepIndex === 0 && !this.isCompleted;
  }

  public get enableCompletedStep(): boolean {
    return this.activeStepIndex === this.displayedSteps.length - 2 &&
      !this.isCompleted;
  }

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public get cancelTextContent(): string {
    return this.cancelText ? this.cancelText :
      this.wizardTextContent ? this.wizardTextContent.cancel : '';
  }

  public get completedTextContent(): string {
    return this.completedText ? this.completedText :
      this.wizardTextContent ? this.wizardTextContent.completed : '';
  }

  public ngAfterContentInit() {
    // Get all steps and set the first step to active
    this.wizardSteps.forEach((step) => {
      this.steps.push(step);
    });
    if (this.steps.length > 0) {
      this.setActiveStep(this.steps[0]);
    }

    // Set text content
    this.wizardTextContent = this._textContentProvider.content.sharedComponents.wizard;
  }

  public onClickCancel(): void {
    this.onCancel.emit();
  }

  public onClickNext(): void {
    if (!this.hasNextStep) { return; }

    // Set Active step to completed
    this.activeStep.completed = true;
    let nextStep: WizardStepComponent = this.displayedSteps[this.activeStepIndex + 1];
    this.setActiveStep(nextStep);
  }

  public onClickPrevious(): void {
    if (!this.hasPreviousStep) { return; }

    let previousStep: WizardStepComponent = this.displayedSteps[this.activeStepIndex - 1];
    this.setActiveStep(previousStep);
  }

  public onClickCompleted(): void {
    if (!this.enableCompletedStep) { return; }

    this.isCompleted = true;
    // Set Active step to completed
    this.activeStep.completed = true;
    this.onComplete.emit();
    let nextStep: WizardStepComponent = this.displayedSteps[this.activeStepIndex + 1];
    this.setActiveStep(nextStep);
  }

  public goToStep(step: WizardStepComponent) {
    if (this.isCompleted || !step.enabled) { return; }
    this.setActiveStep(step);
  }

  public setActiveStep(step: WizardStepComponent): void {
    if (this.activeStep !== step) {
      // Set the previous step to inactive
      this.activeStep.isActive = false;

      // Set the new step to active
      step.isActive = true;
      this.activeStep = step;
      this.activeStep.enabled = true;

      // Set the active step index
      this.activeStepIndex = this.displayedSteps.indexOf(this.activeStep);
      this.onStepChanged.emit(this.activeStep);
    }
  }
}
