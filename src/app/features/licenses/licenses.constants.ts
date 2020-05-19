import { Provider } from '@angular/core';
import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';

import { LicensesComponent } from './licenses.component';
import { LicensesResolver } from './licenses.resolver';

export const licensesProviders: Provider[] = [
    LicensesResolver
];

export const licensesComponents: any = [
    LicensesComponent
];

export const licensesRoutes: Routes = [
  {
    path: '',
    component: LicensesComponent,
    resolve: {
      licenses: LicensesResolver
    },
  }
];
