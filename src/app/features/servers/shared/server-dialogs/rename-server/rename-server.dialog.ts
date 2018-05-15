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
  CoreValidators,
  GoogleAnalyticsEventsService
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
  public disabledRenameButton: boolean;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _ga: GoogleAnalyticsEventsService,
    public dialogRef: McsDialogRef<RenameServerDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.renameServerDialog;
    this.server = this.dialogData as Server[][0];
    this.disabledRenameButton = true;
    this._registerFormControl();
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this._sendEventTracking('rename-cancel-click');
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to new server name
   * @param newName New name of the server
   */
  public renameServer(serverNameInput: HTMLInputElement): void {
    if (isNullOrEmpty(serverNameInput)) { return; }
    if (this.fcServerName.valid) {
      this._sendEventTracking('rename-confirm-click');
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
    this.fcServerName.valueChanges.subscribe((inputValue) => {
      this.disabledRenameButton = !!(isNullOrEmpty(inputValue) ||
        this.server.name === inputValue);
    });
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

  private _sendEventTracking(event: string): void {
    this._ga.emitEvent('server', event, 'rename-dialog');
  }
}
