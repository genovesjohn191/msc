import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import { McsServerMedia } from '@app/models';

@Component({
  selector: 'mcs-detach-media-dialog',
  templateUrl: './detach-media.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'detach-media-dialog-wrapper'
  }
})

export class DetachMediaDialogComponent {
  public media: McsServerMedia;

  constructor(
    private _translateService: TranslateService,
    public dialogRef: McsDialogRef<DetachMediaDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: McsServerMedia
  ) {
    this.media = this.dialogData;
  }

  /**
   * Dialog title
   */
  public get dialogTitle(): string {
    if (isNullOrEmpty(this.media)) { return ''; }

    return this._translateService.instant(
      'serverShared.dialogDetachMedia.alert',
      { media_name: this.media.name }
    );
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
  public detachMedia(): void {
    this.dialogRef.close(this.media);
  }
}
