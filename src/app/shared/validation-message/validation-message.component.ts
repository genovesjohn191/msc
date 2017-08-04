import {
  Component,
  Input
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationMessageService } from './validation-message.service';

@Component({
  selector: 'mcs-validation-message',
  templateUrl: './validation-message.component.html',
  styles: [require('./validation-message.component.scss')]
})

export class ValidationMessageComponent {
  @Input()
  public control: FormControl;

  public constructor(private _validationMessageService: ValidationMessageService) {
    this.control = new FormControl();
  }

  /**
   * This will return the validation message based on the control input
   *
   * `@Note` The validator of the control must be implemented
   * in the CoreValidator class or else it will not return any message
   */
  public get validationMessage(): string {
    if (!this.control) { return undefined; }
    let message: string;

    // Loop to all the properties of the affected validators
    // and display all of those error in the view
    for (let propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
        message = this._validationMessageService
          .getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
        break;
      }
    }
    return message;
  }
}
