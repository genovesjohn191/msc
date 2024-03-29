import {
  of,
  Observable
} from 'rxjs';
import {
  concatMap,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {
  CoreRoutes,
  McsNavigationService,
  McsUniqueId
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  McsServer,
  McsServerDelete,
  McsServerPasswordReset,
  McsServerPowerstateCommand,
  McsServerRename,
  RouteKey,
  ServerCommand,
  VmPowerstateCommand
} from '@app/models';
import { Os } from '@app/models/enumerations/os.enum';
import { McsApiService } from '@app/services';
import {
  DialogActionType,
  DialogConfirmation,
  DialogConfirmationConfig2,
  DialogResult,
  DialogResultAction,
  DialogService,
  DialogService2
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { RenameServerDialogComponent } from '../server-dialogs/rename-server/rename-server.dialog';

@Component({
  selector: 'mcs-server-command',
  templateUrl: './server-command.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'id'
  }
})
export class ServerCommandComponent {
  @Input()
  public server: McsServer;

  @Input()
  public excluded: ServerCommand[];

  @Input()
  public id: string;

  @Input()
  public autoCalculatePosition: boolean = true;

  @Output()
  public commandExecuted = new EventEmitter<ServerCommand>();

  @ViewChild('popoverActionElement')
  public popoverActionElement: any;

  private _actionMap = new Map<ServerCommand, () => Observable<any>>();

  constructor(
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _dialogService2: DialogService2,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
  ) {
    this.id = McsUniqueId.NewId('server-command');
    this.excluded = new Array<ServerCommand>();
    this._createActionMap();
  }

  public get gearIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get serverCommandEnum() {
    return ServerCommand;
  }

  public get viewInPlatformLabel(): string {
    return getSafeProperty(this.server, (obj) => obj.isDedicated, false) ?
      this._translateService.instant('servers.viewVCenter') :
      this._translateService.instant('servers.viewVCloud');
  }

  /**
   * Event that emits when the command has been executed
   * @param command Command action to be excuted
   */
  public onExecuteCommand(command: ServerCommand) {
    if (this.popoverActionElement) { this.popoverActionElement.close(); }
    this.commandExecuted.emit(command);

    let actionFound = this._actionMap.get(command);
    if (isNullOrEmpty(actionFound)) { return; }
    actionFound();
  }

  /**
   * Gets the included command
   * @param command Command to be executed
   */
  public getIncludedCommand(command: ServerCommand): boolean {
    let included = true;
    if (!isNullOrEmpty(this.excluded)) {
      included = isNullOrEmpty(this.excluded.find((excludedCommand) => {
        return excludedCommand === command;
      }));
    }
    return included;
  }

  public getResetPasswordTooltipText(): string {
    if (this.server.isSelfManaged && this.server.isVCloud)  {
      return this._translateService.instant('servers.resetPasswordTooltip.vmwareToolsNotRunning');
    }

    if (this.server.operatingSystem.type === Os.ESX)  {
      return this._translateService.instant('servers.resetPasswordTooltip.unsupportedOs');
    }

    return this._translateService.instant('servers.resetPasswordTooltip.osAutomationUnavailable');
  }

  /**
   * Creates action map table
   */
  private _createActionMap(): void {
    this._actionMap.set(ServerCommand.Clone, this._cloneServer.bind(this));
    this._actionMap.set(ServerCommand.Delete, this._deleteServer.bind(this));
    this._actionMap.set(ServerCommand.Rename, this._renameServer.bind(this));
    this._actionMap.set(ServerCommand.ResetVmPassword, this._resetServerPassword.bind(this));
    this._actionMap.set(ServerCommand.Restart, this._restartServer.bind(this));
    this._actionMap.set(ServerCommand.Resume, this._resumeServer.bind(this));
    this._actionMap.set(ServerCommand.Scale, this._scaleServer.bind(this));
    this._actionMap.set(ServerCommand.Start, this._startServer.bind(this));
    this._actionMap.set(ServerCommand.Stop, this._stopServer.bind(this));
    this._actionMap.set(ServerCommand.Suspend, this._suspendServer.bind(this));
    this._actionMap.set(ServerCommand.ViewPlatform, this._viewServerInPlatform.bind(this));
  }

  /**
   * Starts the server
   */
  private _startServer(): void {
    this._apiService.sendServerPowerState(
      this.server.id,
      createObject(McsServerPowerstateCommand, {
        command: VmPowerstateCommand.Start,
        clientReferenceObject: {
          serverId: this.server.id
        }
      })
    ).subscribe();
  }

  /**
   * Stops the server
   */
  private _stopServer(): void {
    let dialogRef = this._dialogService2.openConfirmation(this.getDialogConfig(ServerCommand.Stop));
    dialogRef.afterClosed().pipe(
      tap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm) { return; }
        this._apiService.sendServerPowerState(
          this.server.id,
          createObject(McsServerPowerstateCommand, {
            command: this.server.vmwareTools.hasToolsRunning ? VmPowerstateCommand.Shutdown : VmPowerstateCommand.PowerOff,
            clientReferenceObject: {
              serverId: this.server.id
            }
          })
        ).subscribe();
      })
    ).subscribe();
  }

  /**
   * Restarts the server
   */
  private _restartServer(): void {
    let dialogRef = this._dialogService2.openConfirmation(this.getDialogConfig(ServerCommand.Restart));
    dialogRef.afterClosed().pipe(
      tap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm) { return; }
        this._apiService.sendServerPowerState(
          this.server.id,
          createObject(McsServerPowerstateCommand, {
            command: this.server.vmwareTools.hasToolsRunning ? VmPowerstateCommand.Restart : VmPowerstateCommand.Reset,
            clientReferenceObject: {
              serverId: this.server.id
            }
          })
        ).subscribe();
      })
    ).subscribe();
  }

  /**
   * Resumes the server
   */
  private _resumeServer(): void {
    let powerState = createObject(McsServerPowerstateCommand, {
      command: VmPowerstateCommand.Resume,
      clientReferenceObject: {
        serverId: this.server.id
      }
    });

    let dialogData = {
      data: powerState,
      title: this._translateService.instant('dialog.serverResumeSingle.title'),
      message: this._translateService.instant('dialog.serverResumeSingle.message'),
      type: 'warning'
    } as DialogConfirmation<McsServerPowerstateCommand>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._apiService.sendServerPowerState(this.server.id, powerState);
      })
    ).subscribe();
  }

  /**
   * Suspends the server
   */
  private _suspendServer(): void {
    let powerState = createObject(McsServerPowerstateCommand, {
      command: VmPowerstateCommand.Suspend,
      clientReferenceObject: {
        serverId: this.server.id
      }
    });

    let dialogData = {
      data: powerState,
      title: this._translateService.instant('dialog.serverSuspendSingle.title'),
      message: this._translateService.instant('dialog.serverSuspendSingle.message'),
      type: 'warning'
    } as DialogConfirmation<McsServerPowerstateCommand>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._apiService.sendServerPowerState(this.server.id, powerState);
      })
    ).subscribe();
  }

  /**
   * Rename the server
   */
  private _renameServer(): void {
    let dialogRef = this._dialogService.open(RenameServerDialogComponent, {
      data: this.server,
      size: 'medium'
    });

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }

        return this._apiService.renameServer(
          this.server.id,
          createObject(McsServerRename, {
            name: dialogResult,
            clientReferenceObject: {
              serverId: this.server.id
            }
          })
        );
      })
    ).subscribe();
  }

  /**
   * Delete the server
   */
  private _deleteServer(): void {
    let deleteDetails = createObject(McsServerDelete, {
      clientReferenceObject: {
        serverId: this.server.id
      }
    });

    let dialogData = {
      data: deleteDetails,
      title: this._translateService.instant('dialog.serverDeleteSingle.title'),
      message: this._translateService.instant('dialog.serverDeleteSingle.message'),
      type: 'warning'
    } as DialogConfirmation<McsServerDelete>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._apiService.deleteServer(this.server.id, deleteDetails).pipe(
          tap(() => {
            this._navigationService.navigateTo(RouteKey.Servers);
          })
        );
      })
    ).subscribe();
  }

  /**
   * Resets the server password
   */
  private _resetServerPassword(): void {
    let resetDetails = createObject(McsServerPasswordReset, {
      clientReferenceObject: {
        serverId: this.server.id
      }
    });

    let messageContentByState = this.server.isSelfManaged ?
      this._translateService.instant('dialog.serverResetPassword.serviceTypeSelfManagedMessage', { server_name: this.server.name }) :
      this._translateService.instant('dialog.serverResetPassword.serviceTypeManagedMessage', { server_name: this.server.name });

    let dialogData = {
      data: resetDetails,
      title: this._translateService.instant('dialog.serverResetPassword.title'),
      message: messageContentByState,
      type: 'info'
    } as DialogConfirmation<McsServerDelete>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._apiService.resetServerPassword(this.server.id, resetDetails);
      })
    ).subscribe();
  }

  /**
   * Clone the server
   */
  private _cloneServer(): void {
    this._navigationService.navigateTo(RouteKey.ServerCreate, [], {
      queryParams: {
        clone: this.server.id, resource: this.server.platform.resourceId
      }
    });
  }

  /**
   * Scales the server
   */
  private _scaleServer(): void {
    if (this.server.isSelfManaged) {
      this._navigationService.navigateTo(RouteKey.Servers, [
        this.server.id, CoreRoutes.getNavigationPath(RouteKey.ServerDetailsManagement)],
        { queryParams: { scale: true } }
      );
      return;
    }
    this._navigationService.navigateTo(RouteKey.OrderServerManagedScale, [],
      {
        queryParams: {
          serverId: this.server.id
        }
      }
    );
  }

  /**
   * View the server in either vCenter or vCloud
   */
  private _viewServerInPlatform(): void {
    window.open(this.server.portalUrl);
  }

  private getDialogConfig(action: number): DialogConfirmationConfig2 {
    let dialogTitle = '';
    let dialogMessage = '';
    let dialogConfirmText = '';

    switch (action) {
      case ServerCommand.Stop:
        dialogConfirmText = this._translateService.instant('action.stop');

        if (this.server.vmwareTools?.hasToolsRunning) {
          dialogTitle = this._translateService.instant('dialog.serverStopSingleWithVMWTRunning.title');
          dialogMessage = this._translateService.instant('dialog.serverStopSingleWithVMWTRunning.message');
        }
        else if (this.server.isVMware && this.server.isVM)  {
          dialogTitle = this._translateService.instant('dialog.serverStopSingleNoVMWTRunning.title');
          dialogMessage = this._translateService.instant('dialog.serverStopSingleNoVMWTRunning.message');
        }
        else {
          dialogTitle = this._translateService.instant('dialog.serverStopSingleVMWTNotApplicable.title');
          dialogMessage = this._translateService.instant('dialog.serverStopSingleVMWTNotApplicable.message');
        }
        break;

      case ServerCommand.Restart:
        dialogConfirmText = this._translateService.instant('action.restart');

        if (this.server.vmwareTools?.hasToolsRunning) {
          dialogTitle = this._translateService.instant('dialog.serverRestartSingleWithVMWTRunning.title');
          dialogMessage = this._translateService.instant('dialog.serverRestartSingleWithVMWTRunning.message');
        }
        else if (this.server.isVMware && this.server.isVM) {
          dialogTitle = this._translateService.instant('dialog.serverRestartSingleNoVMWTRunning.title');
          dialogMessage = this._translateService.instant('dialog.serverRestartSingleNoVMWTRunning.message');
        }
        else {
          dialogTitle = this._translateService.instant('dialog.serverRestartSingleVMWTNotApplicable.title');
          dialogMessage = this._translateService.instant('dialog.serverRestartSingleVMWTNotApplicable.message');
        }
        break;
    }

    return {
      title: dialogTitle,
      type: DialogActionType.Warning,
      message: dialogMessage,
      confirmText: dialogConfirmText,
      cancelText: this._translateService.instant('action.cancel'),
      width: '500px'
    }
  }
}
