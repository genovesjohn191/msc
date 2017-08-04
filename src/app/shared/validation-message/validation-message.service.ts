import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { McsTextContentProvider } from '../../core';

@Injectable()
export class ValidationMessageService {
  private _textContent: any;

  constructor(private _textContentProvider: McsTextContentProvider) {
    this._textContent = _textContentProvider.content.shared.validationMessage;
  }

  /**
   * This will return the validator error message based on the
   * validator name (static field) and return the corresponding message
   * from the text content provider
   * @param validatorName Validator name of the static field
   * @param validatorValue Validator value of the validator name
   */
  public getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    let validationMessage: string;

    switch (validatorName) {
      case 'ipAddress':
        validationMessage = this._textContent.ipAddress;
        break;

      case 'numeric':
        validationMessage = this._textContent.numeric;
        break;

      case 'required':
        validationMessage = this._textContent.required;
        break;

      case 'email':
        validationMessage = this._textContent.email;
        break;

      case 'pattern':
        validationMessage = this._textContent.pattern;
        break;

      case 'minlength':
        validationMessage = this._textContent.minlength
          .replace('{{min_length}}', validatorValue.requiredLength);
        break;

      case 'maxlength':
        validationMessage = this._textContent.maxlength
          .replace('{{max_length}}', validatorValue.requiredLength);
        break;

      case 'min':
        validationMessage = this._textContent.min
          .replace('{{min_value}}', validatorValue.min);
        break;

      case 'max':
        validationMessage = this._textContent.max
          .replace('{{max_value}}', validatorValue.max);
        break;

      case 'custom':
        validationMessage = validatorValue.message;
        break;

      default:
        validationMessage = undefined;
        break;
    }
    return validationMessage;
  }
}
