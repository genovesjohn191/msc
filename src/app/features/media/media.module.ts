import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
/** Services */
import { mediaProviders } from './media.constants';
/** Components */
import { MediaComponent } from './media.component';
/** Shared */
import { MediaCommandComponent } from './shared';

@NgModule({
  declarations: [
    MediaComponent,
    MediaCommandComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...mediaProviders
  ]
})

export class MediaModule { }
