import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout';
import { IconModule } from '../icon/icon.module';
/** Page */
import { PageComponent } from './page.component';
/** Left Panel */
import {
  LeftPanelComponent,
  LeftPanelDefDirective,
  LeftPanelPlaceholderDirective,
  LeftPanelItemComponent,
  LeftPanelItemDefDirective,
  LeftPanelItemPlaceholderDirective
} from './left-panel';
/** Top Panel */
import {
  TopPanelComponent,
  TopPanelDefDirective,
  TopPanelPlaceholderDirective,
  TopPanelItemComponent,
  TopPanelItemDefDirective,
  TopPanelItemPlaceholderDirective
} from './top-panel';
/** Content Panel */
import {
  ContentPanelComponent,
  ContentPanelDefDirective,
  ContentPanelPlaceholderDirective
} from './content-panel';

@NgModule({
  declarations: [
    PageComponent,
    LeftPanelComponent,
    LeftPanelDefDirective,
    LeftPanelPlaceholderDirective,
    LeftPanelItemComponent,
    LeftPanelItemDefDirective,
    LeftPanelItemPlaceholderDirective,
    TopPanelComponent,
    TopPanelDefDirective,
    TopPanelPlaceholderDirective,
    TopPanelItemComponent,
    TopPanelItemDefDirective,
    TopPanelItemPlaceholderDirective,
    ContentPanelComponent,
    ContentPanelDefDirective,
    ContentPanelPlaceholderDirective
  ],
  imports: [
    CommonModule,
    LayoutModule,
    IconModule
  ],
  exports: [
    PageComponent,
    LeftPanelComponent,
    LeftPanelDefDirective,
    LeftPanelPlaceholderDirective,
    LeftPanelItemComponent,
    LeftPanelItemDefDirective,
    LeftPanelItemPlaceholderDirective,
    TopPanelComponent,
    TopPanelDefDirective,
    TopPanelPlaceholderDirective,
    TopPanelItemComponent,
    TopPanelItemDefDirective,
    TopPanelItemPlaceholderDirective,
    ContentPanelComponent,
    ContentPanelDefDirective,
    ContentPanelPlaceholderDirective
  ]
})

export class PageModule { }
