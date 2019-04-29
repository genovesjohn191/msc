import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { apiClientProviders } from '../mcs-api-client.constants';
import { McsApiClientConfig } from '../mcs-api-client.config';
import { McsApiClientConfigMock } from './mcs-api-client-config.mock';
import { McsCookiServiceMock } from './mcs-cookie-service.mock';
import { McsCookieService } from '@app/core';

@NgModule({
  providers: [
    ...apiClientProviders,
    { provide: McsApiClientConfig, useClass: McsApiClientConfigMock },
    { provide: McsCookieService, useClass: McsCookiServiceMock }
  ],
  imports: [
    HttpClientModule,
    HttpClientTestingModule
  ],
  exports: [
    HttpClientModule,
    HttpClientTestingModule
  ]
})

export class McsApiClientTestingModule { }
