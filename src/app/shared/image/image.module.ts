import { NgModule } from '@angular/core';
/** Components/Services */
import { ImageComponent } from './image.component';
import { ImageService } from './image.service';

@NgModule({
  declarations: [
    ImageComponent
  ],
  exports: [
    ImageComponent
  ],
  providers: [
    ImageService
  ]
})

export class ImageModule { }
