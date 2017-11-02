import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { ButtonComponent } from './button.component';

@NgModule({
  declarations: [
    ButtonComponent
  ],
  imports: [
    CommonModule,
    IconModule
  ],
  exports: [
    IconModule,
    ButtonComponent
  ]
})

export class ButtonModule { }
