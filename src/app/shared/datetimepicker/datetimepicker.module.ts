import { NgModule } from '@angular/core';
import { MatDatepickerModule,
  MatInputModule,
  MatNativeDateModule,
  MatFormFieldModule,
  NativeDateModule} from '@angular/material';
import { DateTimePickerComponent } from './datetimepicker.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    DateTimePickerComponent
  ],
  imports: [
  CommonModule,
  MatDatepickerModule,
  MatInputModule,
  MatNativeDateModule,
  MatFormFieldModule,
  NativeDateModule
  ],
  exports: [
    DateTimePickerComponent,
  ]
})
export class DateTimePickerModule { }
