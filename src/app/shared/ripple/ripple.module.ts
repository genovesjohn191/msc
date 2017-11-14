import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleDirective } from './ripple.directive';
import { RippleComponent } from './ripple.component';

@NgModule({
  declarations: [
    RippleComponent,
    RippleDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RippleComponent,
    RippleDirective
  ]
})

export class RippleModule { }
