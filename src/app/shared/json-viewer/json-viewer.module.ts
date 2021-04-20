import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonViewerComponent } from './json-viewer.component';

@NgModule({
  declarations: [
    JsonViewerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    JsonViewerComponent
  ]
})

export class JsonViewerModule { }
