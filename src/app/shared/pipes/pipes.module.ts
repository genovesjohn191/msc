import { NgModule } from '@angular/core';
import { NewLinesPipe } from './new-lines.pipe';
import { MapIterablePipe } from './map-iterable.pipe';
import { FileSizePipe } from './file-size.pipe';
import { SortArrayPipe } from './sort-array.pipe';

@NgModule({
  declarations: [
    NewLinesPipe,
    MapIterablePipe,
    FileSizePipe,
    SortArrayPipe
  ],
  exports: [
    NewLinesPipe,
    MapIterablePipe,
    FileSizePipe,
    SortArrayPipe
  ]
})

export class PipesModule { }
