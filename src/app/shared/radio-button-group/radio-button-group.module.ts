import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { RippleModule } from '../ripple/ripple.module';
import { RadioButtonGroupComponent } from './radio-button-group.component';
import { RadioButtonComponent } from './radio-button/radio-button.component';

@NgModule({
  declarations: [
    RadioButtonComponent,
    RadioButtonGroupComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    RippleModule
  ],
  exports: [
    RadioButtonComponent,
    RadioButtonGroupComponent,
    IconModule,
    RippleModule
  ]
})

export class RadioButtonGroupModule { }
