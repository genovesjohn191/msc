import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { TaskLogStreamViewerComponent } from './task-log-stream-viewer.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '../icon/icon.module';
import { PipesModule } from '../pipes';

@NgModule({
  declarations: [
    TaskLogStreamViewerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ClipboardModule,
    MatButtonModule,
    MatIconModule,
    IconModule,
    PipesModule
  ],
  exports: [
    TaskLogStreamViewerComponent,
    CommonModule
  ]
})
export class TaskLogStreamViewerModule { }