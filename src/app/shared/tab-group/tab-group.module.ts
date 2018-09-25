import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from '../directives';
import { RippleModule } from '../ripple/ripple.module';
import { IconModule } from '../icon/icon.module';
import { ResponsivePanelModule } from '../responsive-panel/responsive-panel.module';
import { TabGroupComponent } from './tab-group.component';
// Tab
import { TabComponent } from './tab/tab.component';
import { TabLabelDirective } from './tab/tab-label.directive';
// Tab header
import { TabHeaderItemComponent } from './tab-header-item/tab-header-item.component';
import { TabBorderBarComponent } from './tab-border-bar/tab-border-bar.component';
// Tab body
import { TabBodyComponent } from './tab-body/tab-body.component';

@NgModule({
  declarations: [
    TabGroupComponent,
    TabComponent,
    TabLabelDirective,
    TabHeaderItemComponent,
    TabBodyComponent,
    TabBorderBarComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    RippleModule,
    ResponsivePanelModule
  ],
  exports: [
    TabGroupComponent,
    TabComponent,
    TabLabelDirective,
    TabHeaderItemComponent,
    TabBodyComponent,
    TabBorderBarComponent,
    IconModule,
    DirectivesModule,
    RippleModule,
    ResponsivePanelModule
  ]
})

export class TabGroupModule { }
