import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** Modules */
import { SharedModule } from '../../shared';
/** Components */
import { SessionComponent } from './session.component';
import {
  SessionIdleDialogComponent,
  SessionTimeoutDialogComponent
} from './session-dialogs';

@NgModule({
  entryComponents: [
    SessionIdleDialogComponent,
    SessionTimeoutDialogComponent
  ],
  declarations: [
    SessionComponent,
    SessionIdleDialogComponent,
    SessionTimeoutDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    SessionComponent
  ]
})

export class SessionModule { }
