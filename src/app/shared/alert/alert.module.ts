import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
/** Components/Services */
import { AlertComponent } from './alert.component';

@NgModule({
  declarations: [
    AlertComponent
  ],
  imports: [
    IconModule,
    LayoutModule
  ],
  exports: [
    AlertComponent
  ]
})

export class AlertModule { }
