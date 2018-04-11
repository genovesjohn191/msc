import { NgModule } from '@angular/core';
import { AccessControlDirective } from './access-control/access-control.directive';
import {
  ExclusiveForAccountDirective
} from './exclusive-for-account/exclusive-for-account.directive';

@NgModule({
  declarations: [
    AccessControlDirective,
    ExclusiveForAccountDirective
  ],
  imports: [],
  exports: [
    AccessControlDirective,
    ExclusiveForAccountDirective
  ]
})

export class AuthenticationModule { }
