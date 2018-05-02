import { NgModule } from '@angular/core';
import { NewLinesPipe } from './new-lines.pipe';
import { MapIterablePipe } from './map-iterable.pipe';
import { FileSizePipe } from './file-size.pipe';

@NgModule({
  declarations: [
    NewLinesPipe,
    MapIterablePipe,
    FileSizePipe
  ],
  exports: [
    NewLinesPipe,
    MapIterablePipe,
    FileSizePipe
  ]
})

export class PipesModule { }
