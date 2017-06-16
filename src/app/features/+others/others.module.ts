import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Components */
import { OthersComponent } from './others.component';
/** Routes */
import { routes } from './others.routes';

@NgModule({
  declarations: [
    OthersComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
  ]
})

export class OthersModule { }
