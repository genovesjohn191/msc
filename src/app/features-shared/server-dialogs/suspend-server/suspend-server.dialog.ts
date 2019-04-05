import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition
} from '@app/core';
import { McsServer } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-suspend-server-dialog',
  templateUrl: './suspend-server.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'suspend-server-dialog-wrapper'
  }
})

export class SuspendServerDialogComponent {
  public servers: McsServer[];

  constructor(
    private _translateService: TranslateService,
    public dialogRef: McsDialogRef<SuspendServerDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this._initialize();
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  public get hasServer(): boolean {
    return !isNullOrEmpty(this.servers);
  }

  public get hasMultipleServers(): boolean {
    return this.hasServer && this.servers.length > 1;
  }

  public get dialogTitle(): string {
    let title = '';

    if (this.hasMultipleServers) {
      title = this._translateService.instant('serverShared.dialogSuspendServer.title.multiple');
    } else {
      let serverName = (this.hasServer) ? this.servers[0].name : '';
      title = this._translateService.instant(
        'serverShared.dialogSuspendServer.title.single',
        { server_name: serverName }
      );
    }

    return title;
  }

  public get dialogAlert(): string {
    return (this.hasMultipleServers) ?
      this._translateService.instant('serverShared.dialogSuspendServer.alert.multiple') :
      this._translateService.instant('serverShared.dialogSuspendServer.alert.single');
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

  private _initialize(): void {
    this.servers = new Array<McsServer>();

    if (Array.isArray(this.dialogData)) {
      this.servers = this.dialogData;
    } else {
      this.servers.push(this.dialogData);
    }
  }
}
