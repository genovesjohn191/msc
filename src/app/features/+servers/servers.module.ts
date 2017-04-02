import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Servers Feature */
import { routes } from './servers.routes';
import { ServersComponent } from './servers.component';
import { ServersService } from './servers.service';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  declarations: [
    ServersComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: [
    ServersComponent,
    RouterModule
  ],
  providers: [
    ServersService
  ]
})

export class ServersModule { }
