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

/** Exported function for AOT compatability */
export function httpFactory(backend: XHRBackend, defaultOptions: BaseRequestOptions) {
  return new Http(backend, defaultOptions);
}

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
      useFactory: httpFactory,
      deps: [MockBackend, BaseRequestOptions]
    },
    AppState,
    { provide: CoreConfig, useClass: MockCoreConfig },
    ...coreProviders
  ],
})

export class CoreTestingModule { }
