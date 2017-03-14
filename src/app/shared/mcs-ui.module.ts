import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Components */
import { ButtonComponent } from './button/button.component';

@NgModule({
  declarations: [
    ButtonComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ButtonComponent
  ]
})

export class McsUiModule { }
