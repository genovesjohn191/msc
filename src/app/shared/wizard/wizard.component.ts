import {
  Component,
  AfterContentInit,
  ContentChildren,
  QueryList,
  Input,
  Output,
  ViewChild,
  TemplateRef,
  EventEmitter,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../core';
import { isNullOrEmpty } from '../../utilities';
import { WizardStepComponent } from './wizard-step/wizard-step.component';

@Component({
  selector: 'mcs-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'wizard-wrapper'
  }
})

export class WizardComponent implements AfterContentInit {
  @Input()
  public header: string;

  @Input()
  public headerTemplate: TemplateRef<any>;

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

  @ViewChild('actionTemplate')
  public actionTemplate: TemplateRef<any>;

  @ContentChildren(WizardStepComponent)
  public wizardSteps: QueryList<WizardStepComponent>;

  public wizardTextContent: any;
  public activeStepIndex: number;
  public isCompleted: boolean;
  public activeStep: WizardStepComponent;

  // This is the list of all the steps in the wizard
  // including the hidden steps. If you want to get the
  // displayed steps only, use the displayedSteps variable instead
  public steps: WizardStepComponent[];

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
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
    this.wizardTextContent = this._textContentProvider.content.shared.wizard;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that triggers when the cancel button is clicked
   */
  public onClickCancel(): void {
    this.onCancel.emit();
  }

  /**
   * Event that triggers when the next button is clicked
   */
  public onClickNext(): void {
    if (!this.hasNextStep) { return; }
    isNullOrEmpty(this.activeStep.onNext.observers) ? this.proceedNext() :
      this.activeStep.onNext.emit(this.proceedNext.bind(this));
  }

  /**
   * Event that triggers when the previous/back button is clicked
   */
  public onClickPrevious(): void {
    if (!this.hasPreviousStep) { return; }
    let previousStep: WizardStepComponent = this.displayedSteps[this.activeStepIndex - 1];
    this.setActiveStep(previousStep);
  }

  /**
   * Event that triggers when the complete/go button is clicked
   */
  public onClickCompleted(): void {
    if (!this.enableCompletedStep) { return; }
    isNullOrEmpty(this.activeStep.onNext.observers) ? this.proceedCompletion() :
      this.activeStep.onNext.emit(this.proceedCompletion.bind(this));
  }

  /**
   * Event that triggers outside when all the requirements are valid to proceed
   */
  public proceedNext(): void {
    this.activeStep.completed = true;
    let nextStep: WizardStepComponent = this.displayedSteps[this.activeStepIndex + 1];
    this.setActiveStep(nextStep);
  }

  /**
   * Event that triggers outside when all the requirements are valid to completion
   */
  public proceedCompletion(): void {
    this.proceedNext();
    this.isCompleted = true;
    this.onComplete.emit();
  }

  /**
   * Go to specified step
   * @param step Step to go through
   */
  public goToStep(step: WizardStepComponent) {
    if (this.isCompleted || !step.enabled) { return; }
    this.setActiveStep(step);
  }

  /**
   * Set active step based on the current step
   * @param step Step to be active
   */
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
      this._attachActionTemplate();
      this.onStepChanged.emit(this.activeStep);
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Attach the action template if it exist in the declaration to
   * the template of the placement.
   */
  private _attachActionTemplate(): void {
    if (isNullOrEmpty(this.activeStep.actionPlacement) ||
      isNullOrEmpty(this.actionTemplate)) { return; }
    this.activeStep.actionPlacement.viewContainerRef
      .createEmbeddedView(this.actionTemplate);
  }
}
