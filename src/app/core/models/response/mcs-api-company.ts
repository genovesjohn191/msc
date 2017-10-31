import { McsCompanyStatus } from '../../enumerations/mcs-company-status.enum';

export class McsApiCompany {
  public id: any;
  public name: string;
  public hasHosting: boolean;
  public hasData: boolean;
  public hasVoice: boolean;
  public hasMobile: boolean;
  public status: McsCompanyStatus;
}
