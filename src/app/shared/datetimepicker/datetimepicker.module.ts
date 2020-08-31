import { NgModule } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatDatepickerModule,
  MatInputModule,
  MatNativeDateModule,
  MatFormFieldModule,
  NativeDateModule
} from '@angular/material';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule
} from '@angular-material-components/datetime-picker';
import { DateTimePickerComponent } from './datetimepicker.component';
import { TimePickerComponent } from './timepicker.component';
import { MinimumTimeValidatorDirective } from './minimum-time-validator.directive';
import { RequiredValidatorDirective } from './required-validator.directive';
@NgModule({
  declarations: [
    DateTimePickerComponent,
    TimePickerComponent,
    MinimumTimeValidatorDirective,
    RequiredValidatorDirective
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
    TimePickerComponent,
    MinimumTimeValidatorDirective,
    RequiredValidatorDirective
  ]
})
export class DateTimePickerModule { }
