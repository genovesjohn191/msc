import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RippleModule } from '../ripple/ripple.module';
import { LayoutModule } from '../layout/layout.module';
import { IconModule } from '../icon/icon.module';
import { CheckboxComponent } from './checkbox.component';

@NgModule({
  declarations: [
    CheckboxComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RippleModule,
    LayoutModule,
    IconModule
  ],
  exports: [
    CheckboxComponent,
    CommonModule,
    FormsModule,
    RippleModule,
    LayoutModule,
    IconModule
  ]
})

export class CheckboxModule { }
