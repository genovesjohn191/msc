import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
/** Components/Services */
import { AlertComponent } from './alert.component';

@NgModule({
  declarations: [
    AlertComponent
  ],
  imports: [
    IconModule,
    DirectivesModule
  ],
  exports: [
    AlertComponent
  ]
})

export class AlertModule { }
