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
} from '@app/core';
import { McsServer } from '@app/models';
import {
  replacePlaceholder,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-resume-server-dialog',
  templateUrl: './resume-server.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'resume-server-dialog-wrapper'
  }
})

export class ResumeServerDialogComponent {
  public textContent: any;
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
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<ResumeServerDialogComponent>,
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
  public resumeServer(): void {
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
    this.textContent = this._textContentProvider.content.servers.shared.resumeServerDialog;
    this.servers = new Array<McsServer>();

    if (Array.isArray(this.dialogData)) {
      this.servers = this.dialogData;
    } else {
      this.servers.push(this.dialogData);
    }
  }
}
