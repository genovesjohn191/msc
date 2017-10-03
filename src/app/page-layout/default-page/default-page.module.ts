import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Modules */
import { CoreLayoutModule } from '../../core-layout';
import { FeaturesModule } from '../../features';
/** Components */
import { DefaultPageComponent } from './default-page.component';
/** Routes */
import { routes } from './default-page.routes';

@NgModule({
  declarations: [
    DefaultPageComponent,
  ],
  imports: [
    CoreLayoutModule,
    FeaturesModule,
    RouterModule.forChild(routes)
  ]
})

export class DefaultPageModule { }
