import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from '../dialog/dialog.module';
import { ButtonModule } from '../button/button.module';
import { ListModule } from '../list/list.module';
import { DirectivesModule } from '../directives/directives.module';
import { InputModule } from '../input/input.module';
import { FormFieldModule } from '../form-field/form-field.module';
import { ItemModule } from '../item/item.module';
/** External modules */
import { FileUploadModule } from 'ng2-file-upload';
import { CommentBoxComponent } from './comment-box.component';

@NgModule({
  declarations: [
    CommentBoxComponent
  ],
  imports: [
    FileUploadModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    ListModule,
    DirectivesModule,
    InputModule,
    FormFieldModule,
    ItemModule
  ],
  exports: [
    FileUploadModule,
    CommentBoxComponent,
    DialogModule,
    ButtonModule,
    ListModule,
    DirectivesModule,
    InputModule,
    FormFieldModule,
    ItemModule
  ]
})

export class CommentBoxModule { }
