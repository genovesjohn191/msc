import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DataStatusComponent } from './data-status.component';
/** Shared */
import {
  DataStatusInProgressComponent,
  DataStatusEmptyComponent,
  DataStatusErrorComponent
 } from './shared';

@NgModule({
  declarations: [
    DataStatusComponent,
    DataStatusInProgressComponent,
    DataStatusEmptyComponent,
    DataStatusErrorComponent
  ],
  imports: [
    CommonModule,
    IconModule
  ],
  exports: [
    DataStatusComponent,
    DataStatusInProgressComponent,
    DataStatusEmptyComponent,
    DataStatusErrorComponent
  ]
})

export class DataStatusModule { }
