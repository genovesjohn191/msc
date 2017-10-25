import { NgModule } from '@angular/core';
import { DisplayFlexDirective } from './display-flex.directive';
import { FlexDirective } from './flex.directive';
import { ReadOnlyDirective } from './read-only.directive';
import { DisabledDirective } from './disabled.directive';
import { CursorDirective } from './cursor.directive';
import { AnimateDirective } from './animation.directive';
import { ScrollableDirective } from './scrollable.directive';
import { StopPropagationDirective } from './stop-propagation.directive';

@NgModule({
  declarations: [
    DisplayFlexDirective,
    FlexDirective,
    ReadOnlyDirective,
    DisabledDirective,
    CursorDirective,
    AnimateDirective,
    ScrollableDirective,
    StopPropagationDirective
  ],
  exports: [
    DisplayFlexDirective,
    FlexDirective,
    ReadOnlyDirective,
    DisabledDirective,
    CursorDirective,
    AnimateDirective,
    ScrollableDirective,
    StopPropagationDirective
  ]
})

export class LayoutModule { }
