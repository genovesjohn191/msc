import { NgModule } from '@angular/core';
import {
  HttpModule,
  XHRBackend
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
/** Mocks */
import { MockCoreConfig } from './core-config.mock';
/** Core Services and Modules */
import { AppState } from '../../app.service';
import { CoreConfig } from '../core.config';
import { coreProviders } from '../core.constants';

@NgModule({
  imports: [
    RouterTestingModule,
    HttpModule
  ],
  exports: [
    RouterTestingModule
  ],
  providers: [
    MockBackend,
    { provide: XHRBackend, useExisting: MockBackend },
    AppState,
    { provide: CoreConfig, useClass: MockCoreConfig },
    ...coreProviders
  ],
})

export class CoreTestingModule { }
