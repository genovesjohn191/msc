import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** Components/Services */
import { ValidationMessageComponent } from './validation-message.component';
import { ValidationMessageService } from './validation-message.service';

@NgModule({
  declarations: [
    ValidationMessageComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    ValidationMessageService
  ],
  exports: [
    ValidationMessageComponent
  ]
})

export class ValidationMessageModule { }
