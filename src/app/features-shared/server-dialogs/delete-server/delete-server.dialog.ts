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
import { isNullOrEmpty } from '@app/utilities';
import { McsServer } from '@app/models';

@Component({
  selector: 'mcs-delete-server-dialog',
  templateUrl: './delete-server.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'delete-server-dialog-wrapper'
  }
})

export class DeleteServerDialogComponent {
  public servers: McsServer[];

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
    private _translateService: TranslateService,
    public dialogRef: McsDialogRef<DeleteServerDialogComponent>,
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
  public deleteServer(): void {
    this.dialogRef.close(true);
  }

  public get dialogTitle(): string {
    let title = '';

    if (this.hasMultipleServers) {
      title = this._translateService.instant('serverShared.dialogDeleteServer.title.multiple');
    } else {
      let serverName = (this.hasServer) ? this.servers[0].name : '';
      title = this._translateService.instant(
        'serverShared.dialogDeleteServer.title.single',
        { server_name: serverName }
      );
    }

    return title;
  }

  public get dialogAlert(): string {
    return (this.hasMultipleServers) ?
      this._translateService.instant('serverShared.dialogDeleteServer.alert.multiple') :
      this._translateService.instant('serverShared.dialogDeleteServer.alert.single');
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
