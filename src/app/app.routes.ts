import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'console',
    loadChildren: './page-layout/+console-page/console-page.module#ConsolePageModule'
  },
  {
    path: '',
    loadChildren: './page-layout/+default-page/default-page.module#DefaultPageModule'
  }
];
