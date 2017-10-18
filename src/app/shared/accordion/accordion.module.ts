import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
import { AccordionComponent } from './accordion.component';
// Accordion panel
import { AccordionPanelComponent } from './accordion-panel/accordion-panel.component';
// Accordion panel header
import {
  AccordionPanelHeaderComponent
} from './accordion-panel-header/accordion-panel-header.component';

@NgModule({
  declarations: [
    AccordionComponent,
    AccordionPanelComponent,
    AccordionPanelHeaderComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    LayoutModule
  ],
  exports: [
    AccordionComponent,
    AccordionPanelComponent,
    AccordionPanelHeaderComponent,
    IconModule,
    LayoutModule
  ]
})

export class AccordionModule { }
