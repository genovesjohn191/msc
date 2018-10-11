import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
/** Components/Services */
import { AlertComponent } from './alert.component';
import { AlertActionDirective } from './alert-action.directive';

@NgModule({
  declarations: [
    AlertComponent,
    AlertActionDirective
  ],
  imports: [
    IconModule,
    DirectivesModule
  ],
  exports: [
    AlertComponent,
    AlertActionDirective
  ]
})

export class AlertModule { }
