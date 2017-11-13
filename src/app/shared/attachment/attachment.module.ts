import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from '../dialog/dialog.module';
import { ButtonModule } from '../button/button.module';
/** External modules */
import { FileUploadModule } from 'ng2-file-upload';
import { AttachmentComponent } from './attachment.component';

@NgModule({
  declarations: [
    AttachmentComponent
  ],
  imports: [
    FileUploadModule,
    CommonModule,
    DialogModule,
    ButtonModule
  ],
  exports: [
    FileUploadModule,
    AttachmentComponent,
    DialogModule,
    ButtonModule
  ]
})

export class AttachmentModule { }
