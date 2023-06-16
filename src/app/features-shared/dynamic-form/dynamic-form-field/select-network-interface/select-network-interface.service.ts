import { Injectable } from "@angular/core";
import {
  map,
  Observable,
  of
} from "rxjs";
import {
  McsMultiJobFormConfig,
  McsNetworkDbPod,
  McsResourceNetwork,
  McsQueryParam
} from "@app/models";
import { McsApiService } from "@app/services";
import {
  CommonDefinition,
  compareStrings,
  isNullOrEmpty,
  isNullOrUndefined
} from "@app/utilities";
import { EventBusDispatcherService } from "@app/event-bus";
import { McsEvent } from "@app/events";
import {
  FlatOption,
  GroupedOption
} from "../../dynamic-form-field-config.interface";

@Injectable()
export class DynamicSelectNetworkInterfaceService {
  constructor(
    private _apiService: McsApiService,
  ) { }

  private _networks$: Observable<FlatOption[]>;
  private _networks: McsResourceNetwork[];

  public get networkList(): McsResourceNetwork[] {
    return this._networks;
  }

  public getNetworks(id: string, companyId: string): Observable<FlatOption[]> {
    if(isNullOrUndefined(companyId) || isNullOrUndefined(id)) { return of([]); }
    if (!isNullOrEmpty(this._networks)) {
      let options = this.convertItemToFlatOptions(this._networks);
      return of(options);
    }
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, companyId]
    ]);

    let param = new McsQueryParam();
    param.pageSize = CommonDefinition.PAGE_SIZE_MAX;

    this._networks$ = this._apiService.getResourceNetworks(id, optionalHeaders, param).pipe(
      map((response) => {
        if (isNullOrEmpty(response)) { return []; }
        this._networks = response && response.collection;
        let groupedOptions = this.convertItemToFlatOptions(this._networks);
        return groupedOptions;
      }));
    return this._networks$;
  }

  public convertItemToFlatOptions(items: McsResourceNetwork[]): FlatOption[] {
    if(isNullOrEmpty(items)) { return []; }
    let options: FlatOption[] = [];

    items.forEach((item) => {
      let vlanNumber = isNullOrUndefined(item.vlanNumber) ? '' : ` (${item.vlanNumber})`;
      let option = {
        key: item.id,
        value: item.name + vlanNumber
      } as FlatOption;
      options.push(option);
    });
    return options;
  }
}
