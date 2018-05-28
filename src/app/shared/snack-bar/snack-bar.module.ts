import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
import { RippleModule } from '../ripple/ripple.module';
import { SnackBarComponent } from './snack-bar.component';

@NgModule({
  declarations: [
    SnackBarComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    LayoutModule,
    RippleModule
  ],
  exports: [
    SnackBarComponent,
    IconModule,
    LayoutModule,
    RippleModule
  ]
})

export class SnackBarModule { }
