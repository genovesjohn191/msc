import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

// Components Declarations
import { OthersComponent }         from './others.component';

// Routing Configurations
import { routes } from './others.routes';

@NgModule({
  declarations: [
    OthersComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    OthersComponent,
    RouterModule
  ]
})

export class OthersModule {}
