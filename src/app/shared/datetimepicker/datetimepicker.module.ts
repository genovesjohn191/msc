import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatNativeDateModule,
  NativeDateModule
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DateTimePickerComponent } from './datetimepicker.component';
import { MinimumTimeValidatorDirective } from './minimum-time-validator.directive';
import { RequiredValidatorDirective } from './required-validator.directive';
import { TimePickerComponent } from './timepicker.component';

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
