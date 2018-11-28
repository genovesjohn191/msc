import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** Item */
import { ItemComponent } from './item.component';

@NgModule({
  declarations: [
    ItemComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ItemComponent,
    CommonModule
  ]
})

export class ItemModule { }
