import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from '../directives';
import { RippleModule } from '../ripple/ripple.module';
import { ResponsivePanelModule } from '../responsive-panel/responsive-panel.module';
import { ScrollableLinkGroupComponent } from './scrollable-link-group.component';
// Scrollable link
import { ScrollableLinkComponent } from './scrollable-link/scrollable-link.component';
import {
  ScrollableLinkHeaderComponent
} from './scrollable-link-header/scrollable-link-header.component';

@NgModule({
  declarations: [
    ScrollableLinkGroupComponent,
    ScrollableLinkComponent,
    ScrollableLinkHeaderComponent
  ],
  imports: [
    CommonModule,
    DirectivesModule,
    RippleModule,
    ResponsivePanelModule
  ],
  exports: [
    ScrollableLinkGroupComponent,
    ScrollableLinkComponent,
    ScrollableLinkHeaderComponent,
    DirectivesModule,
    RippleModule,
    ResponsivePanelModule
  ]
})

export class ScrollableLinkGroupModule { }
