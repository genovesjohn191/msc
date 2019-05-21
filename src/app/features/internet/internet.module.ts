import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import {
  internetProviders,
  internetRoutes,
  internetRoutesComponents
} from './internet.constants';

@NgModule({
  declarations: [
    ...internetRoutesComponents
  ],
  imports: [
    RouterModule.forChild(internetRoutes),
    SharedModule
  ],
  providers: [...internetProviders]
})

export class InternetModule { }
