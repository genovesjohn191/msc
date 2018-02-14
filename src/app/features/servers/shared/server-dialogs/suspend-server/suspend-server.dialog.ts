import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition,
  McsTextContentProvider
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
    public dialogRef: McsDialogRef<SuspendServerDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this._initialize();
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to true
   */
  public suspendServer(): void {
    this.dialogRef.close(true);
  }

  public get dialogTitle(): string {
    let title = '';

    if (this.hasMultipleServers) {
      title = this.textContent.title.multiple;
    } else {
      let serverName = (this.hasServer) ? this.servers[0].managementName : '' ;
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
}
