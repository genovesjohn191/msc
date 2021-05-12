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
import { DialogNameConfirmationConfig } from './dialog-name-confirmation-config';

@Component({
  selector: 'mcs-dialog-name-confirmation',
  templateUrl: './dialog-name-confirmation.component.html',
})
export class DialogNameConfirmationComponent {
  public fcName: FormControl;

  public constructor(
    public dialogRef: MatDialogRef<DialogNameConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogNameConfirmationConfig
  ) {
    this.fcName = new FormControl('', [
      Validators.required,
      this._customValidator(this._matchNameValidator.bind(this), 'mismatch')
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
    let dialogResult = new DialogResult<boolean>(DialogResultAction.Confirm, this.fcName.valid);
    this.dialogRef.close(dialogResult);
  }

  private _matchNameValidator(input: string): boolean {
    return input === this.fcName?.value;
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
