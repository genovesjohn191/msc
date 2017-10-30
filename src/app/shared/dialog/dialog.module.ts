import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
import { DialogComponent } from './dialog.component';
// Dialog Header
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';
// Dialog Content
import { DialogContentComponent } from './dialog-content/dialog-content.component';
// Dialog Actions
import { DialogActionsComponent } from './dialog-actions/dialog-actions.component';

@NgModule({
  declarations: [
    DialogComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    LayoutModule
  ],
  exports: [
    DialogComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    IconModule,
    LayoutModule
  ]
})

export class DialogModule { }
