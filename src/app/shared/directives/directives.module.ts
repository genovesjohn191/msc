import { NgModule } from '@angular/core';
import { ComponentHandlerDirective } from './component-handler.directive';
import { RouterLinkDirective } from './router-link.directive';
import { RouterLinkActiveDirective } from './router-link-active.directive';
import { CursorDirective } from './cursor.directive';
import { AnimateDirective } from './animation.directive';
import { ScrollableDirective } from './scrollable.directive';
import { StopPropagationDirective } from './stop-propagation.directive';
import { SetFocusDirective } from './set-focus.directive';
import { IdDirective } from './id.directive';
import { AlignContentDirective } from './align-content.directive';
import { AlignDirective } from './align.directive';

import { DisabledDirective } from './overriden-directives/disabled.directive';
import { HiddenDirective } from './overriden-directives/hidden.directive';
import { ReadOnlyDirective } from './overriden-directives/read-only.directive';

@NgModule({
  declarations: [
    ComponentHandlerDirective,
    RouterLinkDirective,
    RouterLinkActiveDirective,
    ReadOnlyDirective,
    DisabledDirective,
    HiddenDirective,
    CursorDirective,
    AnimateDirective,
    ScrollableDirective,
    StopPropagationDirective,
    SetFocusDirective,
    IdDirective,
    AlignContentDirective,
    AlignDirective
  ],
  exports: [
    ComponentHandlerDirective,
    RouterLinkDirective,
    RouterLinkActiveDirective,
    ReadOnlyDirective,
    DisabledDirective,
    HiddenDirective,
    CursorDirective,
    AnimateDirective,
    ScrollableDirective,
    StopPropagationDirective,
    SetFocusDirective,
    IdDirective,
    AlignContentDirective,
    AlignDirective
  ]
})

export class DirectivesModule { }
