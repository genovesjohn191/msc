import { Routes } from '@angular/router';
import { AzureResourcesComponent } from './azure-resources.component';

/**
 * List of routes for the main module
 */
export const azureResourcesRoute: Routes = [
  {
    path: '',
    component: AzureResourcesComponent
  }
];
