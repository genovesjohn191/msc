import { NgModule } from '@angular/core';
/** Modules */
import { CoreLayoutModule } from '@app/core-layout';
import { FeaturesModule } from '@app/features';
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
