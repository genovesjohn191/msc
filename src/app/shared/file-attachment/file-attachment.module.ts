import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from '../dialog/dialog.module';
import { ButtonModule } from '../button/button.module';
import { ListModule } from '../list/list.module';
import { ActionItemModule } from '../action-item/action-item.module';
import { TooltipModule } from '../tooltip/tooltip.module';
/** External modules */
import { FileUploadModule } from 'ng2-file-upload';
import { FileAttachmentComponent } from './file-attachment.component';

@NgModule({
  declarations: [
    FileAttachmentComponent
  ],
  imports: [
    FileUploadModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    ListModule,
    ActionItemModule,
    TooltipModule
  ],
  exports: [
    FileUploadModule,
    FileAttachmentComponent,
    DialogModule,
    ButtonModule,
    ListModule,
    ActionItemModule,
    TooltipModule
  ]
})

export class FileAttachmentModule { }
