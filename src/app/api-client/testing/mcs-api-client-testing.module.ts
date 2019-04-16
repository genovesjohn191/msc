import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { apiClientProviders } from '../mcs-api-client.constants';
import { McsApiClientConfig } from '../mcs-api-client.config';
import { McsApiClientConfigMock } from './mcs-api-client-config.mock';

@NgModule({
  providers: [
    ...apiClientProviders,
    { provide: McsApiClientConfig, useClass: McsApiClientConfigMock }
  ],
  imports: [
    HttpClientModule,
    HttpClientTestingModule
  ],
  exports: [
    HttpClientModule,
    HttpClientTestingModule,
  ]
})

export class McsApiClientTestingModule { }
