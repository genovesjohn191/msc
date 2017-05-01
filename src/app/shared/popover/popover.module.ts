import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** Components/Directives */
import { PopoverComponent } from './popover.component';
import { PopoverDirective } from './popover.directive';

@NgModule({
  declarations: [
    PopoverComponent,
    PopoverDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PopoverDirective
  ],
  entryComponents: [
    PopoverComponent
  ]
})

export class PopoverModule { }
