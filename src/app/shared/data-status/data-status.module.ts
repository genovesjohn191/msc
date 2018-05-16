import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
import { DataStatusComponent } from './data-status.component';
import { DataStatusWarningComponent } from './data-status-warning/data-status-warning.component';
import { DataStatusErrorComponent } from './data-status-error/data-status-error.component';
import { DataStatusSuccessComponent } from './data-status-success/data-status-success.component';
import {
  DataStatusInProgressComponent
} from './data-status-in-progress/data-status-in-progress.component';

@NgModule({
  declarations: [
    DataStatusComponent,
    DataStatusSuccessComponent,
    DataStatusInProgressComponent,
    DataStatusErrorComponent,
    DataStatusWarningComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    LayoutModule
  ],
  exports: [
    DataStatusComponent,
    DataStatusSuccessComponent,
    DataStatusInProgressComponent,
    DataStatusErrorComponent,
    DataStatusWarningComponent
  ]
})

export class DataStatusModule { }
