import { NgModule } from '@angular/core';
/** Modules */
import { CoreLayoutModule } from '../../core-layout';
import { FeaturesModule } from '../../features';
/** Components */
import { DefaultPageComponent } from './default-page.component';

@NgModule({
  entryComponents: [
    DefaultPageComponent
  ],
  declarations: [
    DefaultPageComponent,
  ],
  imports: [
    CoreLayoutModule,
    FeaturesModule
  ]
})

export class DefaultPageModule { }
