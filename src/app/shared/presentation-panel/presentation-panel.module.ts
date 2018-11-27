import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationPanelComponent } from './presentation-panel.component';
import { PresentationPanelHeaderDirective } from './header/presentation-panel-header.directive';

@NgModule({
  declarations: [
    PresentationPanelComponent,
    PresentationPanelHeaderDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    PresentationPanelComponent,
    PresentationPanelHeaderDirective
  ]
})
export class PresentationPanelModule { }
