export class McsApiIdentity {
  public hashedId: string;
  public firstName: string;
  public lastName: string;
  public userId: string;
  public email: string;
  public companyId: string;
  public companyName: string;
  public expiry: Date;
  public permissions: string[];
}
