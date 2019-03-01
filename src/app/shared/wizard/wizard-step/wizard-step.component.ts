import {
  Component,
  Input,
  ViewChild,
  TemplateRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { McsUniqueId } from '@app/core';
import { IWizardStep } from './wizard-step.interface';

@Component({
  selector: 'mcs-wizard-step',
  templateUrl: './wizard-step.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
    '[id]': 'id'
  }
})

export class WizardStepComponent implements IWizardStep {
  public enabled: boolean;
  public isActive: boolean;
  public completed: boolean;
  public isLastStep: boolean;

  @Input()
  public id: any = McsUniqueId.NewId('wizard-step');

  @Input()
  public stepTitle: string;

  @Input()
  public customClass: string;

  /** @deprecated Use the nextWhen instead */
  @Input()
  public stepControl: AbstractControl;

  @ViewChild(TemplateRef)
  public templateRef: TemplateRef<any>;

  public constructor() {
    this.stepTitle = '';
    this.isActive = false;
    this.enabled = false;
    this.completed = false;
    this.isLastStep = false;
  }
}
