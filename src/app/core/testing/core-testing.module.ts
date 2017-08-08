import { NgModule } from '@angular/core';
import {
  BaseRequestOptions,
  HttpModule,
  Http,
  XHRBackend
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieModule } from 'ngx-cookie';
/** Mocks */
import { MockCoreConfig } from './core-config.mock';
/** Core Services and Modules */
import { AppState } from '../../app.service';
import { CoreConfig } from '../core.config';
import { coreProviders } from '../core.constants';

@NgModule({
  imports: [
    RouterTestingModule,
    HttpModule,
    CookieModule.forRoot()
  ],
  exports: [
    RouterTestingModule
  ],
  providers: [
    MockBackend,
    BaseRequestOptions,
    {
      provide: Http,
      deps: [MockBackend, BaseRequestOptions],
      useFactory: (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
        return new Http(backend, defaultOptions);
      }
    },
    AppState,
    { provide: CoreConfig, useClass: MockCoreConfig },
    ...coreProviders
  ],
})

export class CoreTestingModule { }
