import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { BusyRibbonComponent } from './busy-ribbon.component';

@NgModule({
  declarations: [BusyRibbonComponent],
  imports: [
    IconModule
  ],
  exports: [
    IconModule,
    BusyRibbonComponent
  ]
})
export class BusyRibbonModule { }
