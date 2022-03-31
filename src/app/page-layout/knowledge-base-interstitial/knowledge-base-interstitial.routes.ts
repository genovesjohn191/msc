import { Routes } from '@angular/router';
import { McsAuthenticationGuard } from '@app/core';

import { KnowledgeBaseInterstitialComponent } from './knowledge-base-interstitial.component';

export const knowledgeBaseInterstitialRoutes: Routes = [
  {
    path: '',
    component: KnowledgeBaseInterstitialComponent,
    canActivate: [ McsAuthenticationGuard ]
  }
];
