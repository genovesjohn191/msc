import {
  Component,
  Input
} from '@angular/core';

@Component({
  selector: 'mcs-wizard-step',
  templateUrl: './wizard-step.component.html',
  styles: [require('./wizard-step.component.scss')]
})

export class WizardStepComponent {
  @Input()
  public stepTitle: string;

  @Input()
  public hidden: boolean;

  @Input()
  public valid: boolean;

  @Input()
  public showNext: boolean;

  @Input()
  public showPrevious: boolean;

  public enabled: boolean;
  public isActive: boolean;
  public completed: boolean;

  public constructor() {
    this.stepTitle = '';
    this.hidden = false;
    this.showNext = true;
    this.showPrevious = true;
    this.valid = true;
    this.isActive = false;
    this.enabled = false;
    this.completed = false;
  }
}
