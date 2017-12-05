import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieModule } from 'ngx-cookie';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
/** Mocks */
import { MockCoreConfig } from './core-config.mock';
/** Core Services and Modules */
import { AppState } from '../../app.service';
import { CoreConfig } from '../core.config';
import { coreProviders } from '../core.constants';

@NgModule({
  imports: [
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientTestingModule,
    RouterTestingModule,
    CookieModule.forRoot()
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
