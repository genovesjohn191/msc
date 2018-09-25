import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from '../directives/directives.module';
import { IconModule } from '../icon/icon.module';
/** Page */
import { PageHeaderDirective } from './page-header.directive';
import { PageComponent } from './page.component';
import { PageService } from './page.service';
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
    PageHeaderDirective,
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
    DirectivesModule,
    IconModule
  ],
  exports: [
    PageComponent,
    PageHeaderDirective,
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
  providers: [
    PageService
  ]
})

export class PageModule { }
