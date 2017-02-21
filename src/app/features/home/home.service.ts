import { Injectable } from '@angular/core';
import { FusionApiHttpClientService } from '../../core/services/fusion-api-http-client.service';

@Injectable()
export class HomeService {

  constructor(protected fusionApiClientService: FusionApiHttpClientService) { }

  public sayHello(): any {
    return this.fusionApiClientService.get('/marketo/leads/describe')
      .map((res) => { return res.json().toString(); });
  }
}
