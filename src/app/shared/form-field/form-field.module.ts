import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { DirectivesModule } from '../directives/directives.module';
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
    DirectivesModule,
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
    DirectivesModule,
    FormsModule,
    ReactiveFormsModule
  ]
})

export class FormFieldModule { }
