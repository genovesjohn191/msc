import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataStatusModule } from '../data-status/data-status.module';

import { ListPanelComponent } from './list-panel.component';
import { ListPanelContentDirective } from './list-content/list-panel-content.directive';
import { ListPanelContentOutletDirective } from './list-content/list-panel-content.outlet';

@NgModule({
  declarations: [
    ListPanelComponent,
    ListPanelContentDirective,
    ListPanelContentOutletDirective
  ],
  imports: [
    CommonModule,
    DataStatusModule
  ],
  exports: [
    CommonModule,
    DataStatusModule,
    ListPanelComponent,
    ListPanelContentDirective,
    ListPanelContentOutletDirective
  ]
})

export class ListPanelModule { }
