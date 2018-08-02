import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
/** Services */
import {
  mediaProviders,
  mediaRoutesComponents
} from './media.constants';
/** Components */
import { MediaComponent } from './media.component';
/** Shared */
import { MediaCommandComponent } from './shared';

@NgModule({
  entryComponents: [
    ...mediaRoutesComponents
  ],
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
