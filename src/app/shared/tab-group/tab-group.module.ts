import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout';
import { RippleModule } from '../ripple/ripple.module';
import { IconModule } from '../icon/icon.module';
import { TabGroupComponent } from './tab-group.component';
// Tab
import { TabComponent } from './tab/tab.component';
import { TabLabelDirective } from './tab/tab-label.directive';
// Tab header
import { TabHeaderComponent } from './tab-header/tab-header.component';
import { TabHeaderItemComponent } from './tab-header/tab-header-item/tab-header-item.component';
import { TabBorderBarComponent } from './tab-border-bar/tab-border-bar.component';
// Tab body
import { TabBodyComponent } from './tab-body/tab-body.component';

@NgModule({
  declarations: [
    TabGroupComponent,
    TabComponent,
    TabLabelDirective,
    TabHeaderItemComponent,
    TabHeaderComponent,
    TabBodyComponent,
    TabBorderBarComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    LayoutModule,
    RippleModule
  ],
  exports: [
    TabGroupComponent,
    TabComponent,
    TabLabelDirective,
    TabHeaderItemComponent,
    TabHeaderComponent,
    TabBodyComponent,
    TabBorderBarComponent,
    IconModule,
    LayoutModule,
    RippleModule
  ]
})

export class TabGroupModule { }
