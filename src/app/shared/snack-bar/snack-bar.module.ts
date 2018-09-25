import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { RippleModule } from '../ripple/ripple.module';
import { SnackBarComponent } from './snack-bar.component';

@NgModule({
  declarations: [
    SnackBarComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    RippleModule
  ],
  exports: [
    SnackBarComponent,
    IconModule,
    DirectivesModule,
    RippleModule
  ]
})

export class SnackBarModule { }
