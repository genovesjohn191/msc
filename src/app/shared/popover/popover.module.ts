import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from '../directives/directives.module';
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
    DirectivesModule
  ],
  exports: [
    PopoverDirective,
    DirectivesModule
  ],
  providers: [
    PopoverService
  ],
  entryComponents: [
    PopoverComponent
  ]
})

export class PopoverModule { }
