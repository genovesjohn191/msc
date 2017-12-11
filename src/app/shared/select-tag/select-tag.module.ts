import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchModule } from '../search/search.module';
import { RippleModule } from '../ripple/ripple.module';
import { TagListModule } from '../tag-list/tag-list.module';
import { CheckboxModule } from '../checkbox/checkbox.module';
// Select tag components
import { SelectTagComponent } from './select-tag.component';
import { SelectTagSubItemPlaceholderDirective } from './select-tag-sub-item-placeholder.directive';
import { SelectTagMainItemComponent } from './select-tag-main-item/select-tag-main-item.component';
import { SelectTagSubItemComponent } from './select-tag-sub-item/select-tag-sub-item.component';

@NgModule({
  declarations: [
    SelectTagSubItemPlaceholderDirective,
    SelectTagComponent,
    SelectTagMainItemComponent,
    SelectTagSubItemComponent
  ],
  imports: [
    CommonModule,
    SearchModule,
    RippleModule,
    TagListModule,
    CheckboxModule
  ],
  exports: [
    SelectTagComponent,
    SelectTagMainItemComponent,
    SelectTagSubItemComponent
  ]
})

export class SelectTagModule { }
