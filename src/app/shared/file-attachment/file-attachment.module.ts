import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from '../dialog/dialog.module';
import { ButtonModule } from '../button/button.module';
import { ListModule } from '../list/list.module';
import { ActionItemModule } from '../action-item/action-item.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { DirectivesModule } from '../directives';
import { ItemModule } from '../item/item.module';
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
    TranslateModule,
    DialogModule,
    ButtonModule,
    ListModule,
    ActionItemModule,
    TooltipModule,
    DirectivesModule,
    ItemModule
  ],
  exports: [
    FileUploadModule,
    TranslateModule,
    FileAttachmentComponent,
    DialogModule,
    ButtonModule,
    ListModule,
    ActionItemModule,
    TooltipModule,
    DirectivesModule,
    ItemModule
  ]
})

export class FileAttachmentModule { }
