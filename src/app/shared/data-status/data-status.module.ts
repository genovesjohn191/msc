import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
import { DataStatusComponent } from './data-status.component';
/** Shared */
import {
  DataStatusSuccessComponent,
  DataStatusInProgressComponent,
  DataStatusEmptyComponent,
  DataStatusErrorComponent
 } from './shared';

@NgModule({
  declarations: [
    DataStatusComponent,
    DataStatusSuccessComponent,
    DataStatusInProgressComponent,
    DataStatusEmptyComponent,
    DataStatusErrorComponent
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
    DataStatusEmptyComponent,
    DataStatusErrorComponent
  ]
})

export class DataStatusModule { }
