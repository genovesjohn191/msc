import { NgModule } from '@angular/core';
/** Components/Services */
import { IconComponent } from './icon.component';
import { IconService } from './icon.service';

@NgModule({
  declarations: [
    IconComponent
  ],
  exports: [
    IconComponent
  ],
  providers: [
    IconService
  ]
})

export class IconModule { }
