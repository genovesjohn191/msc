import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  McsTextContentProvider,
  CoreDefinition,
  GoogleAnalyticsEventsService
} from '../../../../../core';
import {
  isNullOrEmpty,
  replacePlaceholder
} from '../../../../../utilities';
import { ServerNicSummary } from '../../../models';

@Component({
  selector: 'mcs-delete-nic-dialog',
  templateUrl: './delete-nic.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'delete-nic-dialog-wrapper'
  }
})

export class DeleteNicDialogComponent {
  public textContent: any;
  public nic: ServerNicSummary;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _ga: GoogleAnalyticsEventsService,
    public dialogRef: McsDialogRef<DeleteNicDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: ServerNicSummary
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.deleteNicDialog;
    this.nic = this.dialogData;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this._sendEventTracking('delete-nic-cancel-click');
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to true
   */
  public deleteNic(): void {
    this._sendEventTracking('delete-nic-confirm-click');
    this.dialogRef.close(this.nic);
  }

  /**
   * Display dialog title
   */
  public get dialogTitle(): string {
    if (isNullOrEmpty(this.nic)) { return ''; }
    return replacePlaceholder(
      this.textContent.title,
      'nic_name',
      this.nic.name
    );
  }

  /**
   * Display dialog alert message
   */
  public get dialogAlert(): string {
    if (isNullOrEmpty(this.nic)) { return ''; }
    return replacePlaceholder(
      this.textContent.alert,
      'nic_name',
      this.nic.name
    );
  }

  private _sendEventTracking(event: string): void {
    this._ga.emitEvent('server', event, 'delete-nic-dialog');
  }
}
