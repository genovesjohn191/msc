import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextualHelpComponent } from './contextual-help.component';
import { ContextualHelpDirective } from './contextual-help.directive';

@NgModule({
  declarations: [
    ContextualHelpComponent,
    ContextualHelpDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ContextualHelpComponent,
    ContextualHelpDirective
  ],
  entryComponents: [ContextualHelpComponent]
})

export class ContextualHelpModule { }
