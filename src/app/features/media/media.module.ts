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
  MediaUploadComponent,
  MediaUploadDetailsComponent,
  MediaUploadProvisioningComponent
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
    MediaUploadProvisioningComponent,
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
