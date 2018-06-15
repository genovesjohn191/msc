import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapacityBarComponent } from './capacity-bar.component';
import { PipesModule } from '../pipes';

@NgModule({
  declarations: [
    CapacityBarComponent
  ],
  imports: [
    CommonModule,
    PipesModule
  ],
  exports: [
    CapacityBarComponent
  ]
})

export class CapacityBarModule { }
