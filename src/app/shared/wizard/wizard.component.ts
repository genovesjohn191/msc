import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { McsScrollDispatcherService } from '@app/core';
import {
  coerceBoolean,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

import { WizardStepComponent } from './wizard-step/wizard-step.component';
import { IWizardStep } from './wizard-step/wizard-step.interface';
import { WizardTopPanelDefDirective } from './wizard-top-panel/wizard-top-panel-def.directive';
import { WizardTopPanelPlaceholderDirective } from './wizard-top-panel/wizard-top-panel-placeholder.directive';

@Component({
  selector: 'mcs-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'wizard-wrapper',
    '[class.disabled-element]': 'disabled'
  }
})

export class WizardComponent implements AfterContentInit, OnDestroy {
  public activeStepIndex: number;
  public isCompleted: boolean;
  public activeStep: WizardStepComponent;

  @Input()
  public header: string;

  @Input()
  public headerTemplate: TemplateRef<any>;

  @Input()
  public customClass: string;

  @Output()
  public stepChange: EventEmitter<IWizardStep>;

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
    private _scrollDispatcher: McsScrollDispatcherService
  ) {
    this.isCompleted = false;
    this.activeStep = new WizardStepComponent();
    this.stepChange = new EventEmitter<IWizardStep>();
    this.completed = new EventEmitter<any>();
  }

  public ngAfterContentInit() {
    Promise.resolve().then(() => {
      this._wizardSteps.changes.pipe(takeUntil(this._destroySubject))
        .subscribe(() => this._changeDetectorRef.markForCheck());
      if (!isNullOrEmpty(this.steps)) { this._setActiveStep(this.steps[0]); }

      // Create the top panel definitions
      if (!isNullOrEmpty(this._topPanelDefDirective)) {
        this._topPanelPlaceholder.viewContainer
          .createEmbeddedView(this._topPanelDefDirective.template);
      }
    });

    // Set text content
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get checkIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHECK_BLUE;
  }

  /**
   * Event that triggers when the next button is clicked
   */
  public next(): void {
    this.activeStep.completed = true;
    let nextStep: WizardStepComponent = this.steps[
      Math.min(this.activeStepIndex + 1, this.steps.length)];
    this._setActiveStep(nextStep);
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
   * Disables the wizard including all of its components
   */
  public disableWizard(): void {
    this.disabled = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Enables the wizard including all of its components
   */
  public enableWizard(): void {
    this.disabled = false;
    this._changeDetectorRef.markForCheck();
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
    this.activeStep.isLastStep = this._wizardSteps.last.id === step.id;

    // Set the active step index
    this.activeStepIndex = this.steps.indexOf(this.activeStep);
    if (this.activeStepIndex === (this.steps.length - 1)) {
      this.stepsCompleted();
    }

    this._scrollPageToTop();
    this.stepChange.emit(this.activeStep);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Scrolls to top when route has been changed
   */
  private _scrollPageToTop(): void {
    let scrollableElements = this._scrollDispatcher.getScrollableItems();
    if (isNullOrEmpty(scrollableElements)) { return; }

    scrollableElements.forEach((item) => {
      let scrollableElement = item.getElementRef().nativeElement;
      this._scrollDispatcher.scrollToElement(scrollableElement, 0, 0);
    });
  }
}
