import { NgModule } from '@angular/core';
import { IconModule } from '@app/shared/icon/icon.module';
import { PopoverModule } from '@app/shared/popover/popover.module';

import { CheckboxModule } from '../../checkbox/checkbox.module';
import { ItemModule } from '../../item/item.module';
import { ListModule } from '../../list/list.module';
import { ColumnSelectorComponent } from './column-selector.component';

@NgModule({
  imports: [
    ListModule,
    ItemModule,
    CheckboxModule,
    PopoverModule,
    IconModule
  ],
  declarations: [
    ColumnSelectorComponent
  ],
  exports: [
    ColumnSelectorComponent,
    ListModule,
    ItemModule,
    CheckboxModule
  ]
})
export class ColumnSelectorModule { }
