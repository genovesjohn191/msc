import { NgModule } from '@angular/core';
import {
  apiProviders,
  repositoryProviders
} from '../services.contants';

@NgModule({
  providers: [
    ...apiProviders,
    ...repositoryProviders
  ]
})

export class ServicesTestingModule { }
