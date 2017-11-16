import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconModule } from '../icon/icon.module';
import { InputModule } from '../input/input.module';
import { FormFieldModule } from '../form-field/form-field.module';
import { SearchComponent } from './search.component';

@NgModule({
  declarations: [
    SearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IconModule,
    InputModule,
    FormFieldModule
  ],
  exports: [
    SearchComponent,
    IconModule,
    InputModule,
    FormFieldModule
  ]
})

export class SearchModule { }
