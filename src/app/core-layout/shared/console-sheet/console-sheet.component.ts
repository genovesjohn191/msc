import { BehaviorSubject } from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  CoreRoutes,
  McsPageBase
} from '@app/core';
import {
  McsOption,
  McsServer,
  PlatformType,
  RouteKey
} from '@app/models';
import {
  SideSheetAction,
  SideSheetRef,
  SideSheetResult
} from '@app/shared/side-sheet';
import {
  getSafeFormValue,
  isNullOrEmpty
} from '@app/utilities';

import { ConsoleSheetViewModel } from './console-sheet.viewmodel';

@Component({
  selector: 'mcs-console-sheet',
  templateUrl: './console-sheet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsoleSheetComponent extends McsPageBase implements OnInit, OnDestroy {
  public readonly viewModel: ConsoleSheetViewModel;
  public readonly hideSelection$: BehaviorSubject<boolean>;

  constructor(
    injector: Injector,
    private _sidesheetRef: SideSheetRef<ConsoleSheetComponent>
  ) {
    super(injector);
    this.viewModel = new ConsoleSheetViewModel(injector);
    this.hideSelection$ = new BehaviorSubject(false);
  }

  public get featureName(): string {
    return 'console-sheet';
  }

  public get hasSelectedVm(): boolean {
    return this.viewModel?.fgGroup?.valid;
  }

  public get consoleDescription(): string {
    return !this.hideSelection$.getValue() ?
      this.translate.instant('message.openForConsole') :
      this.translate.instant('message.noServersToDisplay');
  }

  public ngOnInit(): void {
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
}
