import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

// Components Declarations
import { CatalogComponent }         from './catalog.component';

// Routing Configurations
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

export class CatalogModule {}
