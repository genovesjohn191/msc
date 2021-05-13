import {
  Component,
  Inject,
  TemplateRef
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  Validators,
  ValidatorFn
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

import {
  DialogResult,
  DialogResultAction
} from '../models';
import { DialogMatchConfirmationConfig } from './dialog-match-confirmation-config';

@Component({
  selector: 'mcs-dialog-match-confirmation',
  templateUrl: './dialog-match-confirmation.component.html',
})
export class DialogMatchConfirmationComponent {
  public fcInput: FormControl;

  public constructor(
    public dialogRef: MatDialogRef<DialogMatchConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogMatchConfirmationConfig
  ) {
    this.fcInput = new FormControl('', [
      Validators.required,
      this._customValidator(this._matchValueValidator.bind(this), 'mismatched')
    ]);
  }

  public get dialogMessage(): string | TemplateRef<any> {
    return this.dialogData.message;
  }

  public get isMessageTemplate(): boolean {
    return this.dialogData.message instanceof TemplateRef;
  }

  public get confirmText(): string {
    return this.dialogData?.confirmText || 'Confirm';
  }

  public get cancelText(): string {
    return this.dialogData?.cancelText || 'Cancel';
  }

  public onCancelClick(): void {
    let dialogResult = new DialogResult<boolean>(DialogResultAction.Cancel);
    this.dialogRef.close(dialogResult);
  }

  public onConfirmClick(): void {
    if (this.fcInput.invalid) {
      this.fcInput.markAsTouched();
      return;
    }
    let dialogResult = new DialogResult<boolean>(DialogResultAction.Confirm, this.fcInput.valid);
    this.dialogRef.close(dialogResult);
  }

  private _matchValueValidator(input: string): boolean {
    return input === this.dialogData?.valueToMatch;
  }

  public _customValidator(
    predicate: (validation: any) => boolean,
    patternName: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let patternData = {};
      patternData[patternName] = true;

      return !predicate(control.value) ? patternData : null;
    };
  }
}
