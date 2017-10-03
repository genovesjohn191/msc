import { NgModule } from '@angular/core';
/** Components */
import { GadgetsComponent } from './gadgets.component';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  declarations: [
    GadgetsComponent
  ],
  imports: [
    SharedModule
  ]
})

export class GadgetsModule { }
