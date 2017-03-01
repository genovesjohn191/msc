import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Components */
import { ServersComponent } from './servers.component';
import { ChildComponent } from './child/child.component';
/** Routes */
import { routes } from './servers.routes';

@NgModule({
  declarations: [
    ServersComponent,
    ChildComponent
  ],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    ServersComponent,
    ChildComponent,
    RouterModule
  ]
})

export class ServersModule { }
