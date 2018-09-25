import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { ButtonModule } from '../button/button.module';
import { DialogComponent } from './dialog.component';
// Dialog Header
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';
// Dialog Content
import { DialogContentComponent } from './dialog-content/dialog-content.component';
// Dialog Actions
import { DialogActionsComponent } from './dialog-actions/dialog-actions.component';
// Entry Dialogs
import { DialogWarningComponent } from './dialog-warning/dialog-warning.component';

@NgModule({
  entryComponents: [
    DialogWarningComponent
  ],
  declarations: [
    DialogComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    DialogWarningComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    ButtonModule
  ],
  exports: [
    DialogComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    IconModule,
    DirectivesModule,
    ButtonModule
  ]
})

export class DialogModule { }
