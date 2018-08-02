import { NgModule } from '@angular/core';
import { ComponentHandlerDirective } from './component-handler.directive';
import { RouterLinkDirective } from './router-link.directive';
import { RouterLinkActiveDirective } from './router-link-active.directive';

@NgModule({
  declarations: [
    ComponentHandlerDirective,
    RouterLinkDirective,
    RouterLinkActiveDirective
  ],
  exports: [
    ComponentHandlerDirective,
    RouterLinkDirective,
    RouterLinkActiveDirective
  ]
})

export class DirectivesModule { }
