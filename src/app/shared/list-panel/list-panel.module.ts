import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPanelComponent } from './list-panel.component';
import { ListPanelService } from './list-panel.service';
/** List Definition */
import { ListDefDirective } from './list-definition';
/** List headers */
import {
  ListHeaderComponent,
  ListHeaderDefDirective
} from './list-header';
/** List Items */
import {
  ListItemComponent,
  ListItemDefDirective,
  ListItemOutletDirective
} from './list-item';
/** Shared */
import { ListItemsPlaceholderDirective } from './shared';
import { IconModule } from '../icon/icon.module';

@NgModule({
  declarations: [
    ListPanelComponent,
    ListHeaderComponent,
    ListItemComponent,
    ListDefDirective,
    ListItemDefDirective,
    ListItemOutletDirective,
    ListHeaderDefDirective,
    ListItemsPlaceholderDirective
  ],
  imports: [
    CommonModule,
    IconModule
  ],
  exports: [
    ListPanelComponent,
    ListHeaderComponent,
    ListItemComponent,
    ListDefDirective,
    ListItemDefDirective,
    ListItemOutletDirective,
    ListHeaderDefDirective,
    ListItemsPlaceholderDirective
  ],
  providers: [
    ListPanelService
  ]
})

export class ListPanelModule { }
