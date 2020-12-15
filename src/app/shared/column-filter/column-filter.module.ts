import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { CheckboxModule } from '../checkbox/checkbox.module';
import { ItemModule } from '../item/item.module';
import { ListModule } from '../list/list.module';
import { ColumnFilterComponent } from './column-filter.component';

@NgModule({
  imports: [
    ListModule,
    ItemModule,
    CheckboxModule,
    TranslateModule
  ],
  declarations: [
    ColumnFilterComponent
  ],
  exports: [
    ColumnFilterComponent
  ]
})
export class ColumnFilterModule { }
