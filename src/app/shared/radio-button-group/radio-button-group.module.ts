import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { RippleModule } from '../ripple/ripple.module';
import { RadioButtonGroupComponent } from './radio-button-group.component';

@NgModule({
  declarations: [
    RadioButtonGroupComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    RippleModule
  ],
  exports: [
    RadioButtonGroupComponent,
    IconModule,
    RippleModule
  ]
})

export class RadioButtonGroupModule { }
