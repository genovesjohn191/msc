import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
/** Components */
import { NetworkingComponent } from './networking.component';
/** Services */
import { NetworkingService } from './networking.service';
/** Routes */
import { routes } from './networking.routes';

@NgModule({
  declarations: [
    NetworkingComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    NetworkingComponent,
    RouterModule
  ],
  providers: [
    NetworkingService
  ]
})

export class NetworkingModule { }
