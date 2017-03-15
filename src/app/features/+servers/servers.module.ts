import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
/** Servers Feature */
import { routes } from './servers.routes';
import { ServersComponent } from './servers.component';
import { ServersService } from './servers.service';
@NgModule({
  declarations: [
    ServersComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
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
