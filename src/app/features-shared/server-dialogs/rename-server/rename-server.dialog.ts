import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  CoreDefinition,
  CoreValidators
} from '@app/core';
import {
  replacePlaceholder,
  isNullOrEmpty
} from '@app/utilities';
import { McsServer } from '@app/models';
import {
  DIALOG_DATA,
  DialogRef
} from '@app/shared';

@Component({
  selector: 'mcs-rename-server-dialog',
  templateUrl: './rename-server.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'rename-server-dialog-wrapper'
  }
})

export class RenameServerDialogComponent {
  public server: McsServer;
  public fcServerName: FormControl;

  /**
   * Returns true when the servername inputted is invalid
   */
  public get disabledRenameButton(): boolean {
    return isNullOrEmpty(this.fcServerName) ? true : !this.fcServerName.valid;
  }

  constructor(
    public dialogRef: DialogRef<RenameServerDialogComponent>,
    @Inject(DIALOG_DATA) public dialogData
  ) {
    this.server = this.dialogData as McsServer[][0];
    this._registerFormControl();
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to new server name
   * @param newName New name of the server
   */
  public renameServer(serverNameInput: HTMLInputElement): void {
    if (isNullOrEmpty(serverNameInput)) { return; }
    if (this.fcServerName.valid) {
      this.dialogRef.close(serverNameInput.value);
    } else {
      serverNameInput.focus();
    }
  }

  /**
   * Convert max character text
   * @param text Text to be converted
   * @param maxchar Maximum character
   */
  public convertMaxCharText(text: string, maxchar: number): string {
    return replacePlaceholder(text, 'max_char', maxchar.toString());
  }

  /**
   * Register the form control of the input textbox
   */
  private _registerFormControl(): void {
    // Register Form Controls
    this.fcServerName = new FormControl(this.server.name, [
      CoreValidators.required,
      CoreValidators.custom(
        this._serverNameValidator.bind(this),
        'invalidServerName'
      )
    ]);
  }

  /**
   * Returns a Boolean value of true that indicates the new server name
   * format is correct and not the same as the previous server name
   * including the pattern and minimum length the user can enter for the
   * server name
   * @param inputValue New server name
   */
  private _serverNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue) &&
      (this.server && this.server.name !== inputValue);
  }
}
