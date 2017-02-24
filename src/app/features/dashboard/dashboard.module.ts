import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components Declarations
import { DashboardComponent }         from './dashboard.component';

// Directives Declarations
import {
  RedDirective,
  FlatDirective
} from '../../shared';

// Modules Declarations
import { StatusBoxComponent } from '../../shared';

// Routing Configurations
import { routes } from './dashboard.routes';

@NgModule({
  declarations: [
    DashboardComponent,
    StatusBoxComponent,
    RedDirective,
    FlatDirective
  ],
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forRoot(routes),
    NgbModule
  ],
  exports: [
    DashboardComponent,
    RouterModule
  ]
})

export class DashboardModule {}
