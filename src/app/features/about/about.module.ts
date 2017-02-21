import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Components Declarations
import { AboutComponent }         from './about.component';

// Routing Configurations
import { routes } from './about.routes';

@NgModule({
  declarations: [
    AboutComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    AboutComponent,
    RouterModule
  ]
})

export class AboutModule {}
