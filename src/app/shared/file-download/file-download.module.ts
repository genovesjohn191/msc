import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
import { PipesModule } from '../pipes/pipes.module';
import { FileDownloadComponent } from './file-download.component';

@NgModule({
  declarations: [
    FileDownloadComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    LayoutModule,
    PipesModule
  ],
  exports: [
    CommonModule,
    IconModule,
    LayoutModule,
    PipesModule,
    FileDownloadComponent
  ]
})

export class FileDownloadModule { }
