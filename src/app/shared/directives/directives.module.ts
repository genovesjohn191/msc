import { NgModule } from '@angular/core';
import { ComponentHandlerDirective } from './component-handler.directive';

@NgModule({
  declarations: [
    ComponentHandlerDirective
  ],
  exports: [
    ComponentHandlerDirective
  ]
})

export class DirectivesModule { }
