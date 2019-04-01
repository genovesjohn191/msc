import { NgModule } from '@angular/core';
import { CoreTestingModule } from '@app/core/testing';
import {
  apiProviders,
  guardProviders,
  repositoryProviders,
  initializableProviders
} from '../services.contants';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    ...initializableProviders,
    ...apiProviders,
    ...repositoryProviders,
    ...guardProviders
  ]
})

export class ServicesTestingModule { }
