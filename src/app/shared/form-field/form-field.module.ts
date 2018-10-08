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
  HintMessageComponent,
  PrefixComponent,
  SuffixComponent
} from './shared';

@NgModule({
  declarations: [
    FormFieldComponent,
    FormGroupDirective,
    ErrorComponent,
    HintComponent,
    HintMessageComponent,
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
    HintMessageComponent,
    PrefixComponent,
    SuffixComponent,
    DirectivesModule,
    FormsModule,
    ReactiveFormsModule
  ]
})

export class FormFieldModule { }
