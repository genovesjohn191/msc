import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

// Components Declarations
import { DashboardComponent }         from './dashboard.component';

// Routing Configurations
import { routes } from './dashboard.routes';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    DashboardComponent,
    RouterModule
  ]
})

export class DashboardModule {}
