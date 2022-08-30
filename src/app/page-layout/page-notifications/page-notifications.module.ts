import {
  NotifierModule,
  NotifierOptions
} from 'angular-notifier';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';

import { PageNotificationsComponent } from './page-notifications.component';
import {
  SessionComponent,
  SessionIdleDialogComponent
} from './session';
import { StateNotificationComponent } from './state-notification/state-notification.component';
import { WebStompComponent } from './web-stomp/web-stomp.component';

export function notifierConfig(): NotifierOptions {
  return {
    position: {
      horizontal: {
        position: 'right',
        distance: 20
      },
      vertical: {
        position: 'top',
        distance: 20,
        gap: 12
      }
    },
    theme: 'material',
    behaviour: {
      autoHide: 10000,  // Default to 10 seconds
      stacking: 4,
      onClick: 'hide',
      onMouseover: 'pauseAutoHide',
      showDismissButton: false,
    },
    animations: {
      enabled: true,
      show: {
        preset: 'slide',
        speed: 300,
        easing: 'ease'
      },
      hide: {
        preset: 'fade',
        speed: 300,
        easing: 'ease',
        offset: 50
      },
      shift: {
        speed: 300,
        easing: 'ease'
      },
      overlap: 150
    }
  } as NotifierOptions;
}

@NgModule({
  declarations: [
    PageNotificationsComponent,
    WebStompComponent,
    StateNotificationComponent,
    SessionComponent,
    SessionIdleDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NotifierModule.withConfig(notifierConfig())
  ],
  exports: [
    PageNotificationsComponent
  ]
})

export class PageNotificationsModule { }
