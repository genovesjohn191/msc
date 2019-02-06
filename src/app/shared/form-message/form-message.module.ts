import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModule } from '../alert/alert.module';
import { IconModule } from '../icon/icon.module';
import { ButtonModule } from '../button/button.module';
import { DirectivesModule } from '../directives';

import { FormMessageComponent } from './form-message.component';

@NgModule({
  declarations: [
    FormMessageComponent
  ],
  imports: [
    CommonModule,
    AlertModule,
    IconModule,
    ButtonModule,
    DirectivesModule
  ],
  exports: [
    CommonModule,
    AlertModule,
    IconModule,
    ButtonModule,
    DirectivesModule,
    FormMessageComponent
  ]
})

export class FormMessageModule { }
