import {
  map,
  tap,
  BehaviorSubject,
  Observable
} from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  CoreRoutes,
  McsAccessControlService,
  McsPageBase
} from '@app/core';
import {
  McsOption,
  McsOptionGroup,
  McsServer,
  PlatformType,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  SideSheetAction,
  SideSheetRef,
  SideSheetResult
} from '@app/shared/side-sheet';
import {
  getSafeFormValue,
  isNullOrEmpty,
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility
} from '@app/utilities';

import { ConsoleSheetViewModel } from './console-sheet.viewmodel';

interface IServerGroup {
  resource: string;
  servers: McsServer[];
}

@Component({
  selector: 'mcs-console-sheet',
  templateUrl: './console-sheet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsoleSheetComponent extends McsPageBase implements OnInit, OnDestroy {
  public readonly viewModel: ConsoleSheetViewModel;
  public readonly hideSelection$: BehaviorSubject<boolean>;

  public serverGroupDatasource: TreeDatasource<McsOptionGroup>;
  private _serverGroupsChange = new BehaviorSubject<McsOptionGroup[]>(null);

  constructor(
    injector: Injector,
    private _apiService: McsApiService,
    private _accessControl: McsAccessControlService,
    private _sidesheetRef: SideSheetRef<ConsoleSheetComponent>
  ) {
    super(injector);
    this.viewModel = new ConsoleSheetViewModel(injector);
    this.hideSelection$ = new BehaviorSubject(false);
    this.serverGroupDatasource = new TreeDatasource(this._convertServerGroupToTreeItems.bind(this));
  }

  public get featureName(): string {
    return 'console-sheet';
  }

  public get hasSelectedVm(): boolean {
    return this.viewModel?.formGroup?.valid;
  }

  public get consoleDescription(): string {
    return !this.hideSelection$.getValue() ?
      this.translate.instant('message.openForConsole') :
      this.translate.instant('message.noServersToDisplay');
  }

  public ngOnInit(): void {
    this._subscribeToServers();
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  public onCancelConsole(): void {
    this._sidesheetRef?.close();
  }

  public onDataChange(options: McsOption[]): void {
    if (isNullOrEmpty(options)) {
      this.hideSelection$.next(true);
      return;
    }

    let hasVCloud = options.some(option => (option.data as McsServer)?.platform?.type === PlatformType.VCloud);
    this.hideSelection$.next(!hasVCloud);
    this.changeDetector.markForCheck();
  }

  public onViewConsole(): void {
    if (!this.viewModel.validate()) { return; }

    let serverId = getSafeFormValue<string>(this.viewModel.fcServer, obj => obj.value);
    let percentOffset = 80 / 100;
    let offsetedScreenHeight = percentOffset * +screen.height;
    let offsetedScreenWidth = percentOffset * +screen.width;
    let windowFeatures = `directories=yes,titlebar=no,toolbar=no,
      status=no,menubar=no,resizable=yes,scrollbars=yes,
      left=0,top=0,
      width=${offsetedScreenWidth},
      height=${offsetedScreenHeight}`;

    window.open(
      `${CoreRoutes.getNavigationPath(RouteKey.Console)}/${serverId}`,
      serverId,
      windowFeatures
    );

    let sidesheetResult = new SideSheetResult();
    sidesheetResult.action = SideSheetAction.Confirm;
    sidesheetResult.data = serverId;
    this._sidesheetRef.close(sidesheetResult);
  }

  private _subscribeToServers(): void {
    this._apiService.getServers().pipe(
      tap(result => {
        let filteredServers = result.collection?.filter(vm => {
          if (vm.platform?.type !== PlatformType.VCloud) { return false; }

          let dedicatedFlag = this._accessControl
            .hasAccessToFeature('EnableDedicatedVmConsole');
          return vm.isDedicated ? dedicatedFlag : true;
        });

        let serverGroups = new Array<McsOptionGroup>();
        filteredServers?.forEach(server => {
          let resourceName = server.resourceName || 'Others';
          let serverOption = new McsOption(
            server.id,
            server.name,
            this.translate.instant('message.consoleUnavailable', { state: server.statusLabel }),
            !server.isPoweredOn,
            server
          );

          let foundGroup = serverGroups.find(group => group.groupName === resourceName);
          if (foundGroup) {
            foundGroup.options.push(serverOption);
            return;
          }

          let newOptions = new Array<McsOption>();
          newOptions.push(serverOption);
          serverGroups.push(new McsOptionGroup(resourceName, ...newOptions));
        });

        this._serverGroupsChange.next(serverGroups);
      })
    ).subscribe();
  }

  private _convertServerGroupToTreeItems(): Observable<TreeItem<string>[]> {
    return this._serverGroupsChange.pipe(
      map(groups =>
        TreeUtility.convertEntityToTreemItems(groups,
          group => new TreeGroup(group.groupName, group.groupName, group.options, {
            selectable: false,
            excludeFromSelection: true
          }),
          option => new TreeGroup(option.text, option.value, null, {
            selectable: !option.disabled,
            tooltipFunc: () => option.helpText,
            disableWhen: () => option.disabled
          })
        )
      )
    );
  }
}
