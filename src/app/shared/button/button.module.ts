import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { RippleModule } from '../ripple/ripple.module';
import { ButtonComponent } from './button.component';

@NgModule({
  declarations: [
    ButtonComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    RippleModule
  ],
  exports: [
    IconModule,
    RippleModule,
    ButtonComponent
  ]
})

export class ButtonModule { }
