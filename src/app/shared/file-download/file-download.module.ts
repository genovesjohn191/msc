import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { PipesModule } from '../pipes/pipes.module';
import { FileDownloadComponent } from './file-download.component';

@NgModule({
  declarations: [
    FileDownloadComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    PipesModule
  ],
  exports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    PipesModule,
    FileDownloadComponent
  ]
})

export class FileDownloadModule { }
