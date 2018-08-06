import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** List Panel */
import { ListPanelComponent } from './list-panel.component';

@NgModule({
  declarations: [
    ListPanelComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ListPanelComponent,
    CommonModule
  ]
})

export class ListPanelModule { }
