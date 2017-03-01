import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Components */
import { CatalogComponent } from './catalog.component';
/** Routes */
import { routes } from './catalog.routes';

@NgModule({
  declarations: [
    CatalogComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    CatalogComponent,
    RouterModule
  ]
})

export class CatalogModule { }
