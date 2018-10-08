import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { PipesModule } from '../pipes/pipes.module';
import { ButtonModule } from '../button/button.module';
import { DialogComponent } from './dialog.component';
// Dialog Header
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';
// Dialog Content
import { DialogContentComponent } from './dialog-content/dialog-content.component';
// Dialog Actions
import { DialogActionsComponent } from './dialog-actions/dialog-actions.component';
// Entry Dialogs
import { DialogMessageComponent } from './dialog-message/dialog-message.component';
import { DialogConfirmationComponent } from './dialog-confirmation/dialog-confirmation.component';

@NgModule({
  entryComponents: [
    DialogMessageComponent,
    DialogConfirmationComponent
  ],
  declarations: [
    DialogComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    DialogMessageComponent,
    DialogConfirmationComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    PipesModule,
    ButtonModule
  ],
  exports: [
    DialogComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    IconModule,
    DirectivesModule,
    PipesModule,
    ButtonModule
  ]
})

export class DialogModule { }
