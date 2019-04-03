import { NgModule } from '@angular/core';
import { CoreLayoutModule } from '@app/core-layout';
/** Components */
import { RouterModule } from '@angular/router';
import { defaultPageRoutes } from './default-page.routes';
import { DefaultPageComponent } from './default-page.component';

@NgModule({
  declarations: [
    DefaultPageComponent,
  ],
  imports: [
    CoreLayoutModule,
    RouterModule.forChild(defaultPageRoutes)
  ]
})

export class DefaultPageModule { }
