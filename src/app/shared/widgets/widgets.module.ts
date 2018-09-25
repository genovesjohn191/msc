import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from '../directives/directives.module';
import { IconModule } from '../icon/icon.module';
/** Widgets */
import { QuoteWidgetComponent } from './quote-widget/quote-widget.component';

@NgModule({
  declarations: [
    QuoteWidgetComponent
  ],
  imports: [
    CommonModule,
    DirectivesModule,
    IconModule
  ],
  exports: [
    DirectivesModule,
    IconModule,
    QuoteWidgetComponent
  ]
})

export class WidgetsModule { }
