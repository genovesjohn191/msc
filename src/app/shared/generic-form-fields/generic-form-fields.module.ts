import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeEditorFormFieldComponent } from './code-editor/code-editor-form-field.component';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CodeEditorFormFieldComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    QuillModule.forRoot(),
  ],
  exports: [
    CodeEditorFormFieldComponent,
    CommonModule
  ]
})
export class GenericFormFieldsModule { }