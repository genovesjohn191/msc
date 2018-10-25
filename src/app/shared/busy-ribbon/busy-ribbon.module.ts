import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LoaderModule } from '../loader/loader.module';
import { BusyRibbonComponent } from './busy-ribbon.component';

@NgModule({
  declarations: [BusyRibbonComponent],
  imports: [
    IconModule,
    LoaderModule
  ],
  exports: [
    IconModule,
    LoaderModule,
    BusyRibbonComponent
  ]
})
export class BusyRibbonModule { }
