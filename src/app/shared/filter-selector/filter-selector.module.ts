import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '../directives/directives.module';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { PipesModule } from '../pipes/pipes.module';
import { FilterSelectorComponent } from './filter-selector.component';

@NgModule({
  declarations: [
    FilterSelectorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DirectivesModule,
    CheckboxModule,
    PipesModule
  ],
  exports: [
    FilterSelectorComponent,
    DirectivesModule,
    CheckboxModule,
    PipesModule
  ]
})

export class FilterSelectorModule { }
