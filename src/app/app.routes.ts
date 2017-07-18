import { Routes } from '@angular/router';
import { McsAuthenticationGuard } from './core';

export const routes: Routes = [
  {
    path: 'console/:id',
    loadChildren: './page-layout/+console-page/console-page.module#ConsolePageModule',
    canActivate: [ McsAuthenticationGuard ]
  },
  {
    path: '',
    loadChildren: './page-layout/+default-page/default-page.module#DefaultPageModule',
    canActivate: [ McsAuthenticationGuard ]
  }
];
