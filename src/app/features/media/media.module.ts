import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
/** Services */
import {
  mediaProviders,
  mediaRoutesComponents
} from './media.constants';
/** Components */
import { MediaComponent } from './media.component';
import {
  MediumComponent,
  MediumOverviewComponent,
  MediumServersComponent
} from './medium';
/** Shared */
import { MediaCommandComponent } from './shared';

@NgModule({
  entryComponents: [
    ...mediaRoutesComponents
  ],
  declarations: [
    MediaComponent,
    MediumComponent,
    MediumOverviewComponent,
    MediumServersComponent,
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
