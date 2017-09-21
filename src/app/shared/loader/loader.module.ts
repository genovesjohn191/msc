import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader.component';
import { LoaderDirective } from './loader.directive';

/** Backdrop */
import { LoaderBackdropComponent } from './loader-backdrop/loader-backdrop.component';

/** Modules */
import { IconModule } from '../icon/icon.module';

@NgModule({
  declarations: [
    LoaderComponent,
    LoaderBackdropComponent,
    LoaderDirective
  ],
  imports: [
    CommonModule,
    IconModule
  ],
  exports: [
    LoaderDirective,
    IconModule
  ],
  entryComponents: [
    LoaderComponent
  ]
})

export class LoaderModule { }
