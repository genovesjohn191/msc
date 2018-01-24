import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { LayoutModule } from '../layout/layout.module';
import { FormFieldComponent } from './form-field.component';
import { FormGroupDirective } from './form-group.directive';
// Shared components
import {
  ErrorComponent,
  HintComponent,
  PrefixComponent,
  SuffixComponent
} from './shared';

@NgModule({
  declarations: [
    FormFieldComponent,
    FormGroupDirective,
    ErrorComponent,
    HintComponent,
    PrefixComponent,
    SuffixComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    FormFieldComponent,
    FormGroupDirective,
    ErrorComponent,
    HintComponent,
    PrefixComponent,
    SuffixComponent,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule
  ]
})

export class FormFieldModule { }
