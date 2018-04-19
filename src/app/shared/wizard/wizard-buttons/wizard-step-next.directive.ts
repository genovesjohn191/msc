import {
  Directive,
  Input,
  forwardRef,
  Inject
} from '@angular/core';
import { WizardComponent } from '../wizard.component';

@Directive({
  selector: 'button[mcsWizardStepNext], a[mcsWizardStepNext]',
  host: {
    'class': 'wizard-step-next-button-wrapper',
    '[type]': 'type',
    '(click)': 'wizard.next()'
  }
})

export class WizardStepNextDirective {
  @Input()
  public type: any;

  constructor(@Inject(forwardRef(() => WizardComponent)) public wizard) {}
}
