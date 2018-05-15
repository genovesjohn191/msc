import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition,
  McsTextContentProvider,
  GoogleAnalyticsEventsService
} from '../../../../../core';
import { Server } from '../../../models';
import {
  replacePlaceholder,
  isNullOrEmpty
} from '../../../../../utilities';

@Component({
  selector: 'mcs-suspend-server-dialog',
  templateUrl: './suspend-server.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'suspend-server-dialog-wrapper'
  }
})

export class SuspendServerDialogComponent {
  public textContent: any;
  public servers: Server[];

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  public get hasServer(): boolean {
    return !isNullOrEmpty(this.servers);
  }

  public get hasMultipleServers(): boolean {
    return this.hasServer && this.servers.length > 1;
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _ga: GoogleAnalyticsEventsService,
    public dialogRef: McsDialogRef<SuspendServerDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this._initialize();
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this._sendEventTracking('suspend-cancel-click');
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to true
   */
  public suspendServer(): void {
    this._sendEventTracking('suspend-confirm-click');
    this.dialogRef.close(true);
  }

  public get dialogTitle(): string {
    let title = '';

    if (this.hasMultipleServers) {
      title = this.textContent.title.multiple;
    } else {
      let serverName = (this.hasServer) ? this.servers[0].name : '' ;
      title = replacePlaceholder(this.textContent.title.single, 'server_name', serverName);
    }

    return title;
  }

  public get dialogAlert(): string {
    return (this.hasMultipleServers) ?
      this.textContent.alert.multiple :
      this.textContent.alert.single ;
  }

  private _initialize(): void {
    this.textContent = this._textContentProvider.content.servers.shared.suspendServerDialog;
    this.servers = new Array<Server>();

    if (Array.isArray(this.dialogData)) {
      this.servers = this.dialogData;
    } else {
      this.servers.push(this.dialogData);
    }
  }

  private _sendEventTracking(event: string): void {
    this._ga.emitEvent('server', event, 'suspend-dialog');
  }
}
