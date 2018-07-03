import { NgModule } from '@angular/core';
/** Provider contants */
import { resourcesProviders } from '../resources.constants';

@NgModule({
  providers: [
    ...resourcesProviders
  ],
})

export class ResourcesTestingModule { }
