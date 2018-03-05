import { NgModule } from '@angular/core';
import { NewLinesPipe } from './new-lines.pipe';

@NgModule({
  declarations: [
    NewLinesPipe
  ],
  exports: [
    NewLinesPipe
  ]
})

export class PipesModule { }
