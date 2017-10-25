import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
/** Components/Directives */
import { PopoverComponent } from './popover.component';
import { PopoverDirective } from './popover.directive';

@NgModule({
  declarations: [
    PopoverComponent,
    PopoverDirective
  ],
  imports: [
    CommonModule,
    LayoutModule
  ],
  exports: [
    PopoverDirective,
    LayoutModule
  ],
  entryComponents: [
    PopoverComponent
  ]
})

export class PopoverModule { }
