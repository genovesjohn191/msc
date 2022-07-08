import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { OverlayModule } from '../overlay/overlay.module';
import { DirectivesModule } from '../directives/directives.module';
import { RippleModule } from '../ripple/ripple.module';

import { SnackBarService } from './snack-bar.service';
import { SnackBarComponent } from './snack-bar.component';
import { SnackBarContainerComponent } from './snack-bar-container/snack-bar-container.component';
import { SnackBarRefDirective } from './snack-bar-ref/snack-bar-ref.directive';

@NgModule({
  providers: [
    SnackBarService
  ],
  declarations: [
    SnackBarContainerComponent,
    SnackBarRefDirective,
    SnackBarComponent
  ],
  imports: [
    CommonModule,
    OverlayModule,
    IconModule,
    DirectivesModule,
    RippleModule
  ],
  exports: [
    SnackBarContainerComponent,
    SnackBarRefDirective,
    SnackBarComponent,
    IconModule,
    DirectivesModule,
    RippleModule
  ]
})

export class SnackBarModule { }
