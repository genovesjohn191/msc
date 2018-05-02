import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { PipesModule } from '../pipes/pipes.module';
import { FileDownloadComponent } from './file-download.component';

@NgModule({
  declarations: [
    FileDownloadComponent
  ],
  imports: [
    IconModule,
    PipesModule
  ],
  exports: [
    IconModule,
    PipesModule,
    FileDownloadComponent
  ]
})

export class FileDownloadModule { }
