import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../pipes/pipes.module';
import { ContextualHelpComponent } from './contextual-help.component';
import { ContextualHelpDirective } from './contextual-help.directive';

@NgModule({
  declarations: [
    ContextualHelpComponent,
    ContextualHelpDirective
  ],
  imports: [
    CommonModule,
    PipesModule
  ],
  exports: [
    ContextualHelpComponent,
    ContextualHelpDirective,
    PipesModule
  ]
})

export class ContextualHelpModule { }
