import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '../icon/icon.module';
import { LoaderModule } from '../loader/loader.module';
import { DirectivesModule } from '../directives/directives.module';
import { ItemModule } from '../item/item.module';
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
    TranslateModule,
    IconModule,
    LoaderModule,
    DirectivesModule,
    ItemModule
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
