import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
import { RippleModule } from '../ripple/ripple.module';
/** List Panel */
import { ListPanelComponent } from './list-panel.component';

@NgModule({
  declarations: [
    ListPanelComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    LayoutModule,
    RippleModule
  ],
  exports: [
    ListPanelComponent,
    CommonModule,
    IconModule,
    LayoutModule,
    RippleModule
  ]
})

export class ListPanelModule { }
