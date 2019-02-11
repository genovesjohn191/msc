import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieModule } from 'ngx-cookie';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppState } from '@app/app.service';
import { EventBusTestingModule } from '@app/event-bus/testing';
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
    CookieModule.forRoot(),
    EventBusTestingModule
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
