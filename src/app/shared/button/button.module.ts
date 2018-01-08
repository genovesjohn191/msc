import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { RippleModule } from '../ripple/ripple.module';
import { ButtonComponent } from './button.component';
import { ButtonLinkComponent } from './button-link.component';
import { ButtonDirective } from './button.directive';

@NgModule({
  declarations: [
    ButtonComponent,
    ButtonLinkComponent,
    ButtonDirective
  ],
  imports: [
    CommonModule,
    IconModule,
    RippleModule
  ],
  exports: [
    IconModule,
    RippleModule,
    ButtonComponent,
    ButtonLinkComponent,
    ButtonDirective
  ]
})

export class ButtonModule { }
