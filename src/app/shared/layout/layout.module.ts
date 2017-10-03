import { NgModule } from '@angular/core';
import { DisplayFlexDirective } from './display-flex.directive';
import { FlexDirective } from './flex.directive';
import { ReadOnlyDirective } from './read-only.directive';
import { CursorDirective } from './cursor.directive';

@NgModule({
  declarations: [
    DisplayFlexDirective,
    FlexDirective,
    ReadOnlyDirective,
    CursorDirective
  ],
  exports: [
    DisplayFlexDirective,
    FlexDirective,
    ReadOnlyDirective,
    CursorDirective
  ]
})

export class LayoutModule { }
