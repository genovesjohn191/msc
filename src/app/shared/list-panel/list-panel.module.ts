import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPanelComponent } from './list-panel.component';
import { ListPanelService } from './list-panel.service';
/** List Definition */
import { ListPanelDefDirective } from './list-panel-def';
/** List Headers */
import {
  ListPanelHeaderComponent,
  ListPanelHeaderDefDirective
} from './list-panel-header';
/** List Items */
import {
  ListPanelItemComponent,
  ListPanelItemDefDirective,
  ListPanelItemOutletDirective
} from './list-panel-item';
/** List items status */
import {
  ListItemsEmptyComponent,
  ListItemsErrorComponent,
  ListItemsEmptyDefDirective,
  ListItemsErrorDefDirective,
  ListItemsStatusDefDirective
} from './list-items-status';
/** Shared */
import {
  ListItemsPlaceholderDirective,
  ListItemsStatusPlaceholderDirective
} from './shared';
import { IconModule } from '../icon/icon.module';

@NgModule({
  declarations: [
    ListPanelComponent,
    ListPanelDefDirective,
    ListPanelHeaderComponent,
    ListPanelHeaderDefDirective,
    ListPanelItemComponent,
    ListPanelItemDefDirective,
    ListPanelItemOutletDirective,
    ListItemsPlaceholderDirective,
    ListItemsEmptyComponent,
    ListItemsErrorComponent,
    ListItemsEmptyDefDirective,
    ListItemsErrorDefDirective,
    ListItemsStatusDefDirective,
    ListItemsStatusPlaceholderDirective
  ],
  imports: [
    CommonModule,
    IconModule
  ],
  exports: [
    ListPanelComponent,
    ListPanelDefDirective,
    ListPanelHeaderComponent,
    ListPanelHeaderDefDirective,
    ListPanelItemComponent,
    ListPanelItemDefDirective,
    ListPanelItemOutletDirective,
    ListItemsPlaceholderDirective,
    ListItemsEmptyComponent,
    ListItemsErrorComponent,
    ListItemsEmptyDefDirective,
    ListItemsErrorDefDirective,
    ListItemsStatusDefDirective,
    ListItemsStatusPlaceholderDirective
  ],
  providers: [
    ListPanelService
  ]
})

export class ListPanelModule { }
