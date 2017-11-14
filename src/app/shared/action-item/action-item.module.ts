import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from '../ripple/ripple.module';
import { ActionItemComponent } from './action-item.component';

@NgModule({
  declarations: [
    ActionItemComponent
  ],
  imports: [
    CommonModule,
    RippleModule
  ],
  exports: [
    ActionItemComponent,
    RippleModule
  ]
})

export class ActionItemModule { }
