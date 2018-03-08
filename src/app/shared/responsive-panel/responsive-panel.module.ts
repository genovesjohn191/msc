import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
import { RippleModule } from '../ripple/ripple.module';
import { ResponsivePanelComponent } from './responsive-panel.component';
import { ResponsivePanelBarComponent } from './responsive-panel-bar/responsive-panel-bar.component';
import {
  ResponsivePanelItemDirective
} from './responsive-panel-item/responsive-panel-item.directive';

@NgModule({
  declarations: [
    ResponsivePanelComponent,
    ResponsivePanelBarComponent,
    ResponsivePanelItemDirective
  ],
  imports: [
    CommonModule,
    IconModule,
    LayoutModule,
    RippleModule
  ],
  exports: [
    ResponsivePanelComponent,
    ResponsivePanelBarComponent,
    ResponsivePanelItemDirective,
    IconModule,
    LayoutModule,
    RippleModule
  ]
})

export class ResponsivePanelModule { }
