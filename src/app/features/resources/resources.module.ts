import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

import { ResourcesComponent } from './resources.component';
import {
  resourcesProviders,
  resourcesRoutes
} from './resources.constants';
import { ResourceComponent } from './resource/resource.component';
import { ResourceOverviewComponent } from './resource/overview/resource-overview.component';
import { ResourceStorageComponent } from './resource/storage/resource-storage.component';
import { DiskPanelComponent } from './resource/storage/disk-panel/disk-panel.component';

@NgModule({
  declarations: [
    ResourcesComponent,
    ResourceComponent,
    ResourceOverviewComponent,
    ResourceStorageComponent,
    DiskPanelComponent
  ],
  imports: [
    RouterModule.forChild(resourcesRoutes),
    FeaturesSharedModule,
    SharedModule
  ],
  providers: [...resourcesProviders]
})

export class ResourcesModule { }
