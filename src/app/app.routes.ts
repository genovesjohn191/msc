import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './core-layout/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'servers', pathMatch: 'full' },
  { path: 'others', loadChildren: './features/+others/others.module#OthersModule' },
  { path: '**', component: PageNotFoundComponent },
];
