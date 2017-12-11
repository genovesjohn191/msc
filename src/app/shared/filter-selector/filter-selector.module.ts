import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { FilterSelectorComponent } from './filter-selector.component';

@NgModule({
  declarations: [
    FilterSelectorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule
  ],
  exports: [
    FilterSelectorComponent,
    CheckboxModule
  ]
})

export class FilterSelectorModule { }
