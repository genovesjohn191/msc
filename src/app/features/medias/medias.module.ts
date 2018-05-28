import { NgModule } from '@angular/core';
/** Components */
import { MediasComponent } from './medias.component';
/** Shared */
import { MediaCommandComponent } from './shared';
/** Services */
import { mediasProviders } from './medias.constants';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  declarations: [
    MediasComponent,
    MediaCommandComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...mediasProviders
  ]
})

export class MediasModule { }
