import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  McsTextContentProvider
} from '@app/core';
import {
  isNullOrEmpty,
  replacePlaceholder
} from '@app/utilities';
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
  public textContent: any;
  public media: McsServerMedia;

  /**
   * Dialog title
   */
  public get dialogTitle(): string {
    if (isNullOrEmpty(this.media)) { return ''; }
    return replacePlaceholder(
      this.textContent.title,
      'media_name',
      this.media.name
    );
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<DetachMediaDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: McsServerMedia
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.detachMediaDialog;
    this.media = this.dialogData;
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
