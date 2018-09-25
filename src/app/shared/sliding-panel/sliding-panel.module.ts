import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from '../directives/directives.module';
import { SlidingPanelComponent } from './sliding-panel.component';

@NgModule({
  declarations: [
    SlidingPanelComponent
  ],
  imports: [
    CommonModule,
    DirectivesModule
  ],
  exports: [
    CommonModule,
    DirectivesModule,
    SlidingPanelComponent
  ]
})

export class SlidingPanelModule { }
