import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Components Declarations
import { HomeComponent }         from './home.component';

// Routing Configurations
import { routes } from './home.routes';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    HomeComponent,
    RouterModule
  ]
})

export class HomeModule {}
