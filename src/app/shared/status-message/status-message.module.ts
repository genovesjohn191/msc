import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { ItemModule } from '../item/item.module';
import { StatusMessageComponent } from './status-message.component';

@NgModule({
  declarations: [
    StatusMessageComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    ItemModule
  ],
  exports: [
    StatusMessageComponent
  ]
})

export class StatusMessageModule { }
