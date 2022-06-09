import { Injectable } from "@angular/core";
import {
  map,
  Observable,
  of
} from "rxjs";
import {
  McsMultiJobFormConfig,
  McsNetworkDbPod
} from "@app/models";
import { McsApiService } from "@app/services";
import {
  compareStrings,
  isNullOrEmpty
} from "@app/utilities";
import { EventBusDispatcherService } from "@app/event-bus";
import { McsEvent } from "@app/events";
import {
  FlatOption,
  GroupedOption
} from "../../dynamic-form-field-config.interface";
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class DynamicSelectPodsService {
  constructor(
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService
  ) { }

  private _networkPods$: Observable<GroupedOption[]>;
  private _podList: McsNetworkDbPod[];
  private _networkList: McsMultiJobFormConfig[];
  private _selectedPods: number[] = [];
 
  public get podList(): McsNetworkDbPod[] {
    return this._podList;
  }

  public get networkItems(): McsMultiJobFormConfig[] {
    return this._networkList;
  }

  public get selectedPods(): number[] {
    return this._selectedPods;
  }

  public getInitialPodOptions(): Observable<GroupedOption[]> {
    if (!isNullOrEmpty(this._podList)) {
      let options = this.convertItemToGroupOptions(this._podList);
      return of(options);
    }
    this._networkPods$ = this._apiService.getNetworkDbPods().pipe(
      map((response) => {
        if (isNullOrEmpty(response)) { return; }
        this._podList = response.collection;
        let groupedOptions = this.convertItemToGroupOptions(this._podList);
        return groupedOptions;
      }));
    return this._networkPods$;
  }

  public convertItemToGroupOptions(items: McsNetworkDbPod[]): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];
    if (isNullOrEmpty(items)) { return; }
    items?.sort((a, b) => compareStrings(a.siteName, b.siteName))
      .forEach((item) => {
        let groupName = item.siteName;
        let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
        let noFreeVlan = this.podRemainingFreeVlan(item) === 0;
        let option = {
          key: item.id,
          value: item.name,
          disabled: item.freeVlans === 0 || noFreeVlan
        } as FlatOption;

        if (item.freeVlans === 0) {
          option.hint = this._translateService.instant('networkDb.vlans.reserveHints.noFreeVlans');
        }

        if (noFreeVlan) {
          option.hint = this._translateService.instant('networkDb.vlans.reserveHints.freeVlanExceeded');
        }

        if (existingGroup) {
          // Add option to existing gdroup
          existingGroup.options.push(option);
        } else {
          // Add option to new group
          groupedOptions.push({
            type: 'group',
            name: groupName,
            options: [option]
          });
        }
      });
    return groupedOptions;
  }

  public podRemainingFreeVlan(item: McsNetworkDbPod): number {
    let selectedPods = this.selectedPods;
    if (isNullOrEmpty(selectedPods)) { return; }
    let selectedPodCount = selectedPods.filter((pod) => pod === item.id);
    let remainingFreeVlan = item.freeVlans - selectedPodCount?.length;
    return remainingFreeVlan;
  }

  public setNetworkItems(networkItems: McsMultiJobFormConfig[]): void {
    this._networkList = networkItems;
    this._selectedPods = this._getAllSelectedPods(networkItems);
  }

  public dispatchEvent(): void {
    this._eventDispatcher.dispatch(McsEvent.dataChangeCreateNetworkPanelsEvent);
  }

  private _getAllSelectedPods(networkItems: McsMultiJobFormConfig[]): number[] {
    let selectedPods: number[] = [];
    networkItems?.forEach((item) => {
      if (isNullOrEmpty(item?.dynamicFormConfig[6]?.value)) { return; }
      selectedPods.push(...item.dynamicFormConfig[6].value);
    });
    return selectedPods;
  }
}