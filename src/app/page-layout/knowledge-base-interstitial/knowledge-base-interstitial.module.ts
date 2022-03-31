import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';

import { InterstitialHeaderComponent } from './interstitial-header/interstitial-header.component';
import { InterstitialUserPanelComponent } from './interstitial-header/interstitial-user-panel/interstitial-user-panel.component';
import { KnowledgeBaseInterstitialComponent } from './knowledge-base-interstitial.component';
import { knowledgeBaseInterstitialRoutes } from './knowledge-base-interstitial.routes';

@NgModule({
  declarations: [
    KnowledgeBaseInterstitialComponent,
    InterstitialHeaderComponent,
    InterstitialUserPanelComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(knowledgeBaseInterstitialRoutes)
  ]
})

export class KnowledgeBaseInterstitialModule { }
