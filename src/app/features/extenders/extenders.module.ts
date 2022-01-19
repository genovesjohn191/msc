import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

/** Extender Services */
import { ExtendersComponent } from './extenders.component';
import { extendersRoute } from './extenders.constants';

@NgModule({
  declarations: [
    ExtendersComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(extendersRoute)
  ],
  providers: [
  ]
})

export class ExtendersModule { }
