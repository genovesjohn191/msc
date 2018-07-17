import { NgModule } from '@angular/core';
import { NoteComponent } from './note.component';

@NgModule({
  declarations: [
    NoteComponent
  ],
  exports: [
    NoteComponent
  ]
})
export class NoteModule { }
