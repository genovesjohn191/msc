import { ComponentType } from '@angular/cdk/portal';
import {
  Injectable,
  TemplateRef
} from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from '@angular/material/dialog';

import { DialogConfirmationConfig2 } from './dialog-confirmation/dialog-confirmation-config';
import { DialogConfirmationComponent2 } from './dialog-confirmation/dialog-confirmation.component';
import { DialogMatchConfirmationConfig } from './dialog-match-confirmation/dialog-match-confirmation-config';
import { DialogMatchConfirmationComponent } from './dialog-match-confirmation/dialog-match-confirmation.component';
import { DialogMessageConfig2 } from './dialog-message/dialog-message-config';
import { DialogMessageComponent2 } from './dialog-message/dialog-message.component';

@Injectable()
export class DialogService2 {

  constructor(private dialog: MatDialog) { }

  public open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: MatDialogConfig<D>
  ): MatDialogRef<T, R> {
    return this.dialog.open(componentOrTemplateRef, config);
  }

  public openMatchConfirmation<T>(
    dialogData: DialogMatchConfirmationConfig
  ): MatDialogRef<DialogMatchConfirmationComponent> {
    const dialogSize = this.getSizeByConfigType(dialogData.width);

    return this.open(DialogMatchConfirmationComponent, {
      width: dialogSize?.width,
      height: dialogSize?.height,
      data: dialogData
    });
  }

  public openConfirmation<T>(dialogData: DialogConfirmationConfig2): MatDialogRef<DialogConfirmationComponent2> {
    const dialogSize = this.getSizeByConfigType(dialogData.width);

    return this.open(DialogConfirmationComponent2, {
      width: dialogSize?.width,
      height: dialogSize?.height,
      data: dialogData
    });
  }

  public openMessage<T>(dialogData: DialogMessageConfig2): MatDialogRef<DialogMessageComponent2> {
    const dialogSize = this.getSizeByConfigType(dialogData.width);

    return this.open(DialogMessageComponent2, {
      width: dialogSize?.width,
      height: dialogSize?.height,
      data: dialogData
    });
  }

  private getSizeByConfigType(size: string): { width: string, height: string } {
    if (size === 'full') {
      return { width: '100%', height: '100%' };
    }

    return size ?
      { width: size, height: 'auto' } :
      { width: 'auto', height: 'auto' };
  }
}
