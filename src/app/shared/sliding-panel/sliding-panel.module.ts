import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { SlidingPanelComponent } from './sliding-panel.component';

@NgModule({
  declarations: [
    SlidingPanelComponent
  ],
  imports: [
    CommonModule,
    LayoutModule
  ],
  exports: [
    CommonModule,
    LayoutModule,
    SlidingPanelComponent
  ]
})

export class SlidingPanelModule { }
