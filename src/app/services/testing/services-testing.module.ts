import { NgModule } from '@angular/core';
import {
  stateManagers,
  repositoryProviders
} from '../services.contants';

@NgModule({
  providers: [
    ...stateManagers,
    ...repositoryProviders
  ]
})

export class ServicesTestingModule { }
