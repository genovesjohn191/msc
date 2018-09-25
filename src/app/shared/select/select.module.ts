import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { RippleModule } from '../ripple/ripple.module';
import { SelectComponent } from './select.component';
// Select Group
import { SelectGroupComponent } from './select-group/select-group.component';
// Select Item
import { SelectItemComponent } from './select-item/select-item.component';

@NgModule({
  declarations: [
    SelectComponent,
    SelectGroupComponent,
    SelectItemComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    RippleModule
  ],
  exports: [
    SelectComponent,
    SelectGroupComponent,
    SelectItemComponent,
    CommonModule,
    IconModule,
    DirectivesModule,
    RippleModule
  ]
})

export class SelectModule { }
