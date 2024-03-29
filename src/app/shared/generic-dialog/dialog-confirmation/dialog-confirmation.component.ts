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
import { CommonDefinition } from '@app/utilities';

import {
  DialogActionType,
  DialogResult,
  DialogResultAction
} from '../models';
import { DialogConfirmationConfig2 } from './dialog-confirmation-config';

@Component({
  selector: 'mcs-dialog-confirmation',
  templateUrl: './dialog-confirmation.component.html',
  styleUrls: ['./../dialog.component.scss']
})
export class DialogConfirmationComponent2 implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmationComponent2>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogConfirmationConfig2
  ) { }

  public ngOnInit(): void { }

  @HostBinding('class')
  public get hostClass(): string {
    return `dialog-confirmation-wrapper`;
  }

  public get dialogMessage(): string | TemplateRef<any> {
    return this.dialogData.message;
  }

  public get isMessageTemplate(): boolean {
    return this.dialogData.message instanceof TemplateRef;
  }

  public get confirmText(): string {
    return this.dialogData?.confirmText || 'Confirm';
  }

  public get cancelText(): string {
    return this.dialogData?.cancelText || 'Cancel';
  }

  public get buttonColor(): string {
    return this.dialogData.type === DialogActionType.Error ||
      this.dialogData.type === DialogActionType.Warning ? 'warn' : 'primary';
  }

  public onCancelClick(): void {
    let dialogResult = new DialogResult<boolean>(DialogResultAction.Cancel);
    this.dialogRef.close(dialogResult);
  }

  public onConfirmClick(): void {
    let dialogResult = new DialogResult<boolean>(DialogResultAction.Confirm, this.dialogData.data);
    this.dialogRef.close(dialogResult);
  }

  public get statusIconKey(): string {
    switch(this.dialogData.type){
      case DialogActionType.Info:
        return CommonDefinition.ASSETS_SVG_INFO;
      case DialogActionType.Error:
        return CommonDefinition.ASSETS_SVG_ERROR;
      case DialogActionType.Warning:
        return CommonDefinition.ASSETS_SVG_WARNING;
      case DialogActionType.Success:
        return CommonDefinition.ASSETS_SVG_SUCCESS;
      default:
        return '';
    }
  }
}
