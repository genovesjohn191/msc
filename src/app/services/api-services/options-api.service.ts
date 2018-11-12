import { Injectable } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  McsApiSuccessResponse,
  HttpStatusCode,
  McsServerSqlOptions,
  McsServerHidsOptions
} from '@app/models';

/**
 * @deprecated use the order/items/types instead
 */
@Injectable()
export class OptionsApiService {
  // TODO: Needs refactoring once ordering API is ready

  /**
   * Get anti-malware options
   * TODO: Will update this one when API is ready
   */
  public getAntiMalwareServiceOptions(): Observable<McsApiSuccessResponse<string[]>> {
    let response = new McsApiSuccessResponse<string[]>();
    response.status = HttpStatusCode.Success;
    response.totalCount = 2;
    response.content = ['Standard', 'Self-Managed'];

    return of(response);
  }

  /**
   * Get disaster recovery options
   * TODO: Will update this one when API is ready
   */
  public getDisasterRecoveryOptions(): Observable<McsApiSuccessResponse<string[]>> {
    let response = new McsApiSuccessResponse<string[]>();
    response.status = HttpStatusCode.Success;
    response.totalCount = 1;
    response.content = ['Contoso MMAZG00001'];

    return of(response);
  }

  /**
   * Get sql server options
   * TODO: Will update this one when API is ready
   */
  public getSqlServerOptions(): Observable<McsApiSuccessResponse<McsServerSqlOptions>> {
    let response = new McsApiSuccessResponse<McsServerSqlOptions>();
    response.status = HttpStatusCode.Success;
    response.content = {
      versions: ['2008 SP4', '2008 R2 SP3', '2012 SP3', '2016 SP1'],
      editions: ['Web', 'Standard', 'Enterprise', 'Datacenter'],
      architectures: ['x86', 'x64']
    };

    return of(response);
  }

  /**
   * Get infrastructure service level
   * TODO: Will update this one when API is ready
   */
  public getInfrastructureServiceLevelOptions(): Observable<McsApiSuccessResponse<string[]>> {
    let response = new McsApiSuccessResponse<string[]>();
    response.status = HttpStatusCode.Success;
    response.totalCount = 2;
    response.content = ['Standard', 'Premium'];

    return of(response);
  }

  /**
   * Get host intrusion detection options
   * TODO: Will update this one when API is ready
   */
  public getHidsOptions(): Observable<McsApiSuccessResponse<McsServerHidsOptions>> {
    let response = new McsApiSuccessResponse<McsServerHidsOptions>();
    response.status = HttpStatusCode.Success;
    response.content = {
      serviceVariants: ['Standard', 'Self-Managed'],
      protectionLevels: ['Detect', 'Protect'],
      policyTemplates: [
        'LAMP',
        'Linux_Oracle',
        'Active Directory',
        'Exchange Server',
        'File & Print Server',
        'IIS Web Server',
        'MS_SQL Database Server',
        'Generic Member Server'
      ]
    };

    return of(response);
  }
}
