import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '../overlay/overlay.module';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { PipesModule } from '../pipes/pipes.module';
import { ButtonModule } from '../button/button.module';
import { DialogService } from './dialog.service';
import { DialogComponent } from './dialog.component';
import { DialogRefDirective } from './dialog-ref/dialog-ref.directive';
import { DialogContainerComponent } from './dialog-container/dialog-container.component';
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
    DialogConfirmationComponent,
    DialogContainerComponent
  ],
  providers: [
    DialogService
  ],
  declarations: [
    DialogRefDirective,
    DialogComponent,
    DialogContainerComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    DialogMessageComponent,
    DialogConfirmationComponent
  ],
  imports: [
    CommonModule,
    OverlayModule,
    IconModule,
    DirectivesModule,
    PipesModule,
    ButtonModule
  ],
  exports: [
    DialogRefDirective,
    DialogComponent,
    DialogContainerComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    IconModule,
    OverlayModule,
    DirectivesModule,
    PipesModule,
    ButtonModule
  ]
})

export class DialogModule { }
