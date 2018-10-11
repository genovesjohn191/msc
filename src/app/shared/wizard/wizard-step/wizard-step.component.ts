import {
  Component,
  Input,
  ViewChild,
  TemplateRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

// Unique Id that generates during runtime
let nextUniqueId = 0;

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

export class WizardStepComponent {
  @Input()
  public id: any = `mcs-wizard-step-item-${nextUniqueId++}`;

  @Input()
  public stepTitle: string;

  @Input()
  public stepControl: AbstractControl;

  @ViewChild(TemplateRef)
  public templateRef: TemplateRef<any>;

  public enabled: boolean;
  public isActive: boolean;
  public completed: boolean;

  public constructor() {
    this.stepTitle = '';
    this.isActive = false;
    this.enabled = false;
    this.completed = false;
  }
}
