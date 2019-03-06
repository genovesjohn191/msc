import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';
/** Services */
import {
  mediaProviders,
  mediaRoutesComponents
} from './media.constants';
/** Components */
import { MediaComponent } from './media.component';
import {
  MediaUploadComponent,
  MediaUploadDetailsComponent
} from './media-upload';
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
    MediaUploadComponent,
    MediaUploadDetailsComponent,
    MediumComponent,
    MediumOverviewComponent,
    MediumServersComponent,
    MediaCommandComponent,
    MediaManageServersComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule
  ],
  providers: [
    ...mediaProviders
  ]
})

export class MediaModule { }
