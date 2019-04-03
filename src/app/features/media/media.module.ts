import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

import {
  mediaProviders,
  mediaRoutes
} from './media.constants';
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
import {
  MediaCommandComponent,
  MediaManageServersComponent
} from './shared';

@NgModule({
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
    FeaturesSharedModule,
    RouterModule.forChild(mediaRoutes)
  ],
  providers: [
    ...mediaProviders
  ]
})

export class MediaModule { }
