import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
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
import {
  MediaCommandComponent,
  MediaManageServersComponent
} from './shared';

@NgModule({
  entryComponents: [
    ...mediaRoutesComponents
  ],
  declarations: [
    MediaComponent,
    MediumComponent,
    MediumOverviewComponent,
    MediumServersComponent,
    MediaCommandComponent,
    MediaManageServersComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...mediaProviders
  ]
})

export class MediaModule { }
