import { NgModule } from '@angular/core';
/** Providers List */
import { resourcesProviders } from './resources.constants';

@NgModule({
  providers: [
    ...resourcesProviders
  ]
})

export class ResourcesModule { }
