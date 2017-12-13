import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition,
  McsTextContentProvider,
  CoreValidators
} from '../../../../../core';
import {
  replacePlaceholder,
  isNullOrEmpty
} from '../../../../../utilities';
import { Server } from '../../../models';

@Component({
  selector: 'mcs-rename-server-dialog',
  templateUrl: './rename-server.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'rename-server-dialog-wrapper'
  }
})

export class RenameServerDialogComponent {
  public textContent: any;
  public server: Server;
  public fcServerName: FormControl;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<RenameServerDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.renameServerDialog;
    this.server = this.dialogData as Server[][0];
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
    this.fcServerName.valid ?
      this.dialogRef.close(serverNameInput.value) :
      serverNameInput.focus();
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
   * @param inputValue New server name
   */
  private _serverNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue) &&
      (this.server && this.server.name !== inputValue);
  }
}
