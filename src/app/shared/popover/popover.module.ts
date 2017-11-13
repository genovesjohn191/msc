import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
/** Components/Directives */
import { PopoverComponent } from './popover.component';
import { PopoverDirective } from './popover.directive';
import { PopoverService } from './popover.service';

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
  providers: [
    PopoverService
  ],
  entryComponents: [
    PopoverComponent
  ]
})

export class PopoverModule { }
