import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from './page-header.component';
/** Page Title */
import {
  PageTitleComponent,
  PageTitleDefDirective
} from './page-title';
/** Page SubTitle */
import {
  PageSubTitleComponent,
  PageSubTitleDefDirective
} from './page-subtitle';
/** Page Description */
import {
  PageDescriptionComponent,
  PageDescriptionDefDirective
} from './page-description';

/** Shared */
import {
  PageTitlePlaceholderDirective,
  PageSubTitlePlaceholderDirective,
  PageDescriptionPlaceholderDirective
} from './shared';

@NgModule({
  declarations: [
    PageHeaderComponent,
    PageTitleComponent,
    PageSubTitleComponent,
    PageDescriptionComponent,
    PageTitleDefDirective,
    PageSubTitleDefDirective,
    PageDescriptionDefDirective,
    PageTitlePlaceholderDirective,
    PageSubTitlePlaceholderDirective,
    PageDescriptionPlaceholderDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PageHeaderComponent,
    PageTitleComponent,
    PageSubTitleComponent,
    PageDescriptionComponent,
    PageTitleDefDirective,
    PageSubTitleDefDirective,
    PageDescriptionDefDirective,
    PageTitlePlaceholderDirective,
    PageSubTitlePlaceholderDirective,
    PageDescriptionPlaceholderDirective
  ]
})

export class PageHeaderModule { }
