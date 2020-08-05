import { NgModule } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatDatepickerModule,
  MatInputModule,
  MatNativeDateModule,
  MatFormFieldModule,
  NativeDateModule} from '@angular/material';
import { DateTimePickerComponent } from './datetimepicker.component';
import { CommonModule } from '@angular/common';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule} from '@angular-material-components/datetime-picker';
@NgModule({
  declarations: [
    DateTimePickerComponent
  ],
  imports: [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MatDatepickerModule,
  MatButtonModule,
  MatInputModule,
  MatNativeDateModule,
  MatFormFieldModule,
  NativeDateModule,
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule,
  NgxMatMomentModule
  ],
  exports: [
    DateTimePickerComponent,
  ]
})
export class DateTimePickerModule { }
