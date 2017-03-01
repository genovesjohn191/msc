import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/** Components */
import { DashboardComponent } from './dashboard.component';

/** Directives */
import {
  RedDirective,
  FlatDirective
} from '../../shared';

/** Modules */
import { StatusBoxComponent } from '../../shared';
/** Routes */
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

export class DashboardModule { }
