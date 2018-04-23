import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { IconModule } from '../icon/icon.module';
/** Widgets */
import { QuoteWidgetComponent } from './quote-widget/quote-widget.component';

@NgModule({
  declarations: [
    QuoteWidgetComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    IconModule
  ],
  exports: [
    LayoutModule,
    IconModule,
    QuoteWidgetComponent
  ]
})

export class WidgetsModule { }
