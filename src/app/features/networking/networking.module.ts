import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

// Components Declarations
import { NetworkingComponent }         from './networking.component';

// Routing Configurations
import { routes } from './networking.routes';

@NgModule({
  declarations: [
    NetworkingComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    NetworkingComponent,
    RouterModule
  ]
})

export class NetworkingModule {}
