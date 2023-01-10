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
import { NavigateBackwardDirective } from './navigate-backwards.directive';
import { AlignContentDirective } from './align-content.directive';
import { AlignDirective } from './align.directive';
import { GreyedOutDirective } from './greyed-out.directive';
import { TextTruncateDirective } from './text-truncate.directive';
import { IsExperimentalDirective } from './is-experimental.directive';

import { DisabledDirective } from './overriden-directives/disabled.directive';
import { HiddenDirective } from './overriden-directives/hidden.directive';
import { ReadOnlyDirective } from './overriden-directives/read-only.directive';
import { ResizableColumnDirective } from './resizable-column.directive';

@NgModule({
  declarations: [
    IsExperimentalDirective,
    ComponentHandlerDirective,
    RouterLinkDirective,
    RouterLinkActiveDirective,
    ReadOnlyDirective,
    DisabledDirective,
    HiddenDirective,
    CursorDirective,
    GreyedOutDirective,
    TextTruncateDirective,
    AnimateDirective,
    ScrollableDirective,
    StopPropagationDirective,
    SetFocusDirective,
    IdDirective,
    NavigateBackwardDirective,
    AlignContentDirective,
    AlignDirective,
    ResizableColumnDirective
  ],
  exports: [
    IsExperimentalDirective,
    ComponentHandlerDirective,
    RouterLinkDirective,
    RouterLinkActiveDirective,
    ReadOnlyDirective,
    DisabledDirective,
    HiddenDirective,
    CursorDirective,
    GreyedOutDirective,
    TextTruncateDirective,
    AnimateDirective,
    ScrollableDirective,
    StopPropagationDirective,
    SetFocusDirective,
    IdDirective,
    NavigateBackwardDirective,
    AlignContentDirective,
    AlignDirective,
    ResizableColumnDirective
  ]
})

export class DirectivesModule { }
