import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { McsApiClientTestingModule } from '@app/api-client/testing';
import { AppState } from '@app/app.service';
import { EventBusModule } from '@app/event-bus';
import { TranslateModule } from '@ngx-translate/core';

import { CoreConfig } from '../core.config';
import { coreProviders } from '../core.constants';
import { MockCoreConfig } from './core-config.mock';

@NgModule({
  imports: [
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientTestingModule,
    RouterTestingModule,
    EventBusModule.forRoot(),
    McsApiClientTestingModule,
    TranslateModule.forRoot()
  ],
  exports: [
    HttpClientTestingModule
  ],
  providers: [
    AppState,
    { provide: CoreConfig, useClass: MockCoreConfig },
    ...coreProviders
  ],
})

export class CoreTestingModule { }
