import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RippleModule } from '../ripple/ripple.module';
import { DirectivesModule } from '../directives/directives.module';
import { IconModule } from '../icon/icon.module';
import { CheckboxComponent } from './checkbox.component';
import { ButtonModule } from '../button/button.module';

@NgModule({
  declarations: [
    CheckboxComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RippleModule,
    DirectivesModule,
    IconModule,
    ButtonModule
  ],
  exports: [
    CheckboxComponent,
    CommonModule,
    FormsModule,
    RippleModule,
    DirectivesModule,
    IconModule,
    ButtonModule
  ]
})

export class CheckboxModule { }
