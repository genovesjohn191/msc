import { NgModule } from '@angular/core';
import { NewLinesPipe } from './new-lines.pipe';
import { MapIterablePipe } from './map-iterable.pipe';

@NgModule({
  declarations: [
    NewLinesPipe,
    MapIterablePipe
  ],
  exports: [
    NewLinesPipe,
    MapIterablePipe
  ]
})

export class PipesModule { }
