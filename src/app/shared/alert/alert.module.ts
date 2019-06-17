import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { ButtonModule } from '../button/button.module';
/** Components/Services */
import { AlertComponent } from './alert.component';

@NgModule({
  declarations: [
    AlertComponent
  ],
  imports: [
    IconModule,
    DirectivesModule,
    ButtonModule
  ],
  exports: [
    AlertComponent
  ]
})

export class AlertModule { }
