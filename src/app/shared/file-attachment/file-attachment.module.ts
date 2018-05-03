import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from '../dialog/dialog.module';
import { ButtonModule } from '../button/button.module';
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
    ButtonModule
  ],
  exports: [
    FileUploadModule,
    FileAttachmentComponent,
    DialogModule,
    ButtonModule
  ]
})

export class FileAttachmentModule { }
