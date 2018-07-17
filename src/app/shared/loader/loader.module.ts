import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
import { DirectivesModule } from '../directives/directives.module';

import { LoaderComponent } from './loader.component';

@NgModule({
  declarations: [
    LoaderComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    LayoutModule,
    DirectivesModule
  ],
  exports: [
    LoaderComponent,
    IconModule,
    LayoutModule,
    DirectivesModule
  ]
})

export class LoaderModule { }
