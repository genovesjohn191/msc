import {
  Component,
  AfterContentInit,
  ContentChildren,
  QueryList,
  Input,
  Output,
  OnDestroy,
  ViewChild,
  TemplateRef,
  EventEmitter,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ContentChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../core';
import {
  isNullOrEmpty,
  unsubscribeSubject,
  coerceBoolean
} from '../../utilities';
import { WizardStepComponent } from './wizard-step/wizard-step.component';
import { WizardTopPanelDefDirective } from './wizard-top-panel/wizard-top-panel-def.directive';
import {
  WizardTopPanelPlaceholderDirective
} from './wizard-top-panel/wizard-top-panel-placeholder.directive';

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

export class WizardComponent implements AfterContentInit, OnDestroy {
  public textContent: any;
  public activeStepIndex: number;
  public isCompleted: boolean;
  public activeStep: WizardStepComponent;

  @Input()
  public header: string;

  @Input()
  public headerTemplate: TemplateRef<any>;

  @Output()
  public stepChange: EventEmitter<WizardStepComponent>;

  @Output()
  public completed: EventEmitter<any>;

  @Input()
  public get disabled(): boolean { return this._disabled; }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  @ViewChild(WizardTopPanelPlaceholderDirective)
  private _topPanelPlaceholder: WizardTopPanelPlaceholderDirective;

  @ContentChildren(WizardStepComponent)
  private _wizardSteps: QueryList<WizardStepComponent>;

  @ContentChild(WizardTopPanelDefDirective)
  private _topPanelDefDirective: WizardTopPanelDefDirective;

  private _destroySubject = new Subject<void>();
  public get steps(): WizardStepComponent[] {
    return this._wizardSteps.toArray();
  }

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.isCompleted = false;
    this.activeStep = new WizardStepComponent();
    this.stepChange = new EventEmitter<WizardStepComponent>();
    this.completed = new EventEmitter<any>();
  }

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public ngAfterContentInit() {
    this._wizardSteps.changes.pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
    if (!isNullOrEmpty(this.steps)) { this._setActiveStep(this.steps[0]); }

    // Create the top panel definitions
    if (!isNullOrEmpty(this._topPanelDefDirective)) {
      this._topPanelPlaceholder.viewContainer
        .createEmbeddedView(this._topPanelDefDirective.template);
    }

    // Set text content
    this.textContent = this._textContentProvider.content.shared.wizard;
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Event that triggers when the next button is clicked
   */
  public next(): void {
    let wizardStepFormIsValid = (!isNullOrEmpty(this.activeStep.stepControl)
      && this.activeStep.stepControl.valid)
      || isNullOrEmpty(this.activeStep.stepControl);

    if (wizardStepFormIsValid) {
      this.activeStep.completed = true;
      let nextStep: WizardStepComponent = this.steps[
        Math.min(this.activeStepIndex + 1, this.steps.length)];
      this._setActiveStep(nextStep);
    }
  }

  /**
   * Event that triggers when the previous/back button is clicked
   */
  public previous(): void {
    let previousStep: WizardStepComponent = this.steps[Math.max(this.activeStepIndex - 1, 0)];
    this._setActiveStep(previousStep);
  }

  /**
   * Event that emits when all steps are completed
   */
  public stepsCompleted(): void {
    this.isCompleted = true;
    this.completed.emit();
  }

  /**
   * Go to specified step
   * @param step Step to go through
   */
  public moveStepTo(step: WizardStepComponent) {
    let stepIsNotValid = !step.enabled || this.isCompleted;
    if (stepIsNotValid) { return; }
    this._setActiveStep(step);
  }

  /**
   * Set active step based on the current step
   * @param step Step to be active
   */
  private _setActiveStep(step: WizardStepComponent): void {
    let stepIsNotValid = this.disabled || this.activeStep === step;
    if (stepIsNotValid) { return; }

    // Set the previous step to inactive
    this.activeStep.isActive = false;

    // Set the new step to active
    step.isActive = true;
    this.activeStep = step;
    this.activeStep.enabled = true;

    // Set the active step index
    this.activeStepIndex = this.steps.indexOf(this.activeStep);
    if (this.activeStepIndex === (this.steps.length - 1)) {
      this.stepsCompleted();
    }
    this.stepChange.emit(this.activeStep);
    this._changeDetectorRef.markForCheck();
  }
}
