import { NgModule } from '@angular/core';
import { ListModule } from '../list/list.module';
import { ItemModule } from '../item/item.module';
import { CheckboxModule } from '../checkbox/checkbox.module';

import { ColumnFilterComponent } from './column-filter.component';

@NgModule({
  imports: [
    ListModule,
    ItemModule,
    CheckboxModule
  ],
  declarations: [
    ColumnFilterComponent
  ],
  exports: [
    ColumnFilterComponent,
    ListModule,
    ItemModule,
    CheckboxModule
  ]
})
export class ColumnFilterModule { }
