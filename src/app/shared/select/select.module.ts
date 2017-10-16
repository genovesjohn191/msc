import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
import { SelectComponent } from './select.component';
// Select Group
import {SelectGroupComponent} from './select-group/select-group.component';
// Select Item
import {SelectItemComponent} from './select-item/select-item.component';

@NgModule({
  declarations: [
    SelectComponent,
    SelectGroupComponent,
    SelectItemComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    LayoutModule
  ],
  exports: [
    SelectComponent,
    SelectGroupComponent,
    SelectItemComponent,
    IconModule,
    LayoutModule
  ]
})

export class SelectModule { }
