import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconModule } from '../icon/icon.module';
import { ListModule } from '../list/list.module';
import { DynamicListComponent } from './dynamic-list.component';
import { InputModule } from '../input/input.module';
import { FormFieldModule } from '../form-field/form-field.module';
import { ItemModule } from '../item/item.module';
import { ButtonModule } from '../button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TextFieldModule } from '@angular/cdk/text-field';

@NgModule({
  declarations: [
    DynamicListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IconModule,
    ListModule,
    InputModule,
    ItemModule,
    ButtonModule,
    FormFieldModule,
    TextFieldModule
  ],
  exports: [
    DynamicListComponent
  ]
})

export class DynamicListModule { }
