import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '../directives/directives.module';
import { FormFieldComponent } from './form-field.component';
import { McsFormGroupDirective } from './form-group.directive';
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
    McsFormGroupDirective,
    ErrorComponent,
    HintComponent,
    HintMessageComponent,
    PrefixComponent,
    SuffixComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    DirectivesModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    FormFieldComponent,
    McsFormGroupDirective,
    ErrorComponent,
    HintComponent,
    HintMessageComponent,
    PrefixComponent,
    SuffixComponent,
    TranslateModule,
    DirectivesModule,
    FormsModule,
    ReactiveFormsModule
  ]
})

export class FormFieldModule { }
