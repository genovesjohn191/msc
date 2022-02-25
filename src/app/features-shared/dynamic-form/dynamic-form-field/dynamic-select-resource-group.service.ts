import { Injectable } from "@angular/core";
import {
  map,
  Observable,
  of,
  Subject,
  takeUntil,
  tap
} from "rxjs";
import {
  McsAzureResource,
  McsQueryParam
} from "@app/models";
import { McsApiService } from "@app/services";
import {
  CommonDefinition,
  isNullOrEmpty
} from "@app/utilities";

@Injectable()
export class DynamicSelectResourceGroupService {
  constructor(private _apiService: McsApiService) { }

  private _azureResources: McsAzureResource[];
  private _companyId: string;
  private _subscriptionId: string;
  private _resource$: Observable<McsAzureResource[]>;

  private _destroySubject = new Subject<void>();

  public get azureResources(): McsAzureResource[] {
    return this._azureResources;
  }

  public get subscriptionId(): string {
    return this._subscriptionId;
  }

  public setSubscriptionId(subscriptionId: string): void {
    this._subscriptionId = subscriptionId;
  }

  public setCompanyId(id: string): void {
    this._companyId = id;
  }

  public setResources(resources: McsAzureResource[]): void {
    this._azureResources = resources;
  }

  public getAzureResoures(companyId: string): Observable<McsAzureResource[]> {
    let sameCompany = this._companyId === companyId;
    if (!isNullOrEmpty(this._resource$) && sameCompany) {
      return of(this._azureResources);
    }
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, companyId]
    ]);

    let param = new McsQueryParam();
    param.pageSize = CommonDefinition.AZURE_RESOURCES_PAGE_SIZE_MAX;
    this.setCompanyId(companyId);
    this._resource$ = this._apiService.getAzureResources(param, optionalHeaders).pipe(
      takeUntil(this._destroySubject),
      tap(resources => this.setResources(resources.collection)),
      map(response =>  response.collection));

    return this._resource$;
  }
}