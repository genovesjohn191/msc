import {
  Component,
  HostBinding,
  Inject,
  OnInit,
  TemplateRef
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

import {
  DialogResult,
  DialogResultAction
} from '../models';
import { DialogMessageConfig2 } from './dialog-message-config';

@Component({
  selector: 'lib-dialog-message',
  templateUrl: './dialog-message.component.html'
})
export class DialogMessageComponent2 implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogMessageComponent2>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogMessageConfig2
  ) { }

  public ngOnInit(): void { }

  @HostBinding('class')
  public get hostClass(): string {
    return `dialog-message-wrapper`;
  }

  public get dialogMessage(): string | TemplateRef<any> {
    return this.dialogData.message;
  }

  public get isMessageTemplate(): boolean {
    return this.dialogData.message instanceof TemplateRef;
  }

  public get dialogOkText(): string {
    return this.dialogData?.okText || 'OK';
  }

  public onOkClick(): void {
    let dialogResult = new DialogResult<boolean>(DialogResultAction.Ok);
    this.dialogRef.close(dialogResult);
  }
}
