import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  of,
  Observable
} from 'rxjs';
import {
  concatMap,
  tap
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsUniqueId,
  McsNavigationService,
  CoreRoutes
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsServer,
  ServerCommand,
  VmPowerstateCommand,
  McsServerPowerstateCommand,
  McsServerRename,
  McsServerDelete,
  McsServerPasswordReset,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  DialogService,
  DialogConfirmation
} from '@app/shared';
import { RenameServerDialogComponent } from '@app/features-shared';
import { McsEvent } from '@app/event-manager';

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
    private _eventDispatcher: EventBusDispatcherService,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
  ) {
    this.id = McsUniqueId.NewId('server-command');
    this.excluded = new Array<ServerCommand>();
    this._createActionMap();
  }

  public get gearIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  public get serverCommandEnum() {
    return ServerCommand;
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
    this._actionMap.set(ServerCommand.ViewVCloud, this._viewServerInVCloud.bind(this));
  }

  /**
   * Starts the server
   */
  private _startServer(): void {
    let powerState = new McsServerPowerstateCommand();
    powerState.command = VmPowerstateCommand.Start;
    powerState.clientReferenceObject = {
      serverId: this.server.id
    };
    this._apiService.sendServerPowerState(this.server.id, powerState).subscribe();
  }

  /**
   * Stops the server
   */
  private _stopServer(): void {
    let powerState = new McsServerPowerstateCommand();
    powerState.command = VmPowerstateCommand.Stop;
    powerState.clientReferenceObject = {
      serverId: this.server.id
    };
    this._apiService.sendServerPowerState(this.server.id, powerState).subscribe();
  }

  /**
   * Restarts the server
   */
  private _restartServer(): void {
    let powerState = new McsServerPowerstateCommand();
    powerState.command = VmPowerstateCommand.Restart;
    powerState.clientReferenceObject = {
      serverId: this.server.id
    };
    this._apiService.sendServerPowerState(this.server.id, powerState).subscribe();
  }

  /**
   * Resumes the server
   */
  private _resumeServer(): void {
    let powerState = new McsServerPowerstateCommand();
    powerState.command = VmPowerstateCommand.Resume;
    powerState.clientReferenceObject = {
      serverId: this.server.id
    };

    let dialogData = {
      data: powerState,
      title: this._translateService.instant('dialogResumeServerSingle.title'),
      message: this._translateService.instant('dialogResumeServerSingle.message'),
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
    let powerState = new McsServerPowerstateCommand();
    powerState.command = VmPowerstateCommand.Suspend;
    powerState.clientReferenceObject = {
      serverId: this.server.id
    };

    let dialogData = {
      data: powerState,
      title: this._translateService.instant('dialogSuspendServerSingle.title'),
      message: this._translateService.instant('dialogSuspendServerSingle.message'),
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

        let rename = new McsServerRename();
        rename.name = dialogResult;
        rename.clientReferenceObject = {
          serverId: this.server.id
        };
        return this._apiService.renameServer(this.server.id, rename);
      })
    ).subscribe();
  }

  /**
   * Delete the server
   */
  private _deleteServer(): void {
    let deleteDetails = new McsServerDelete();
    deleteDetails.clientReferenceObject = {
      serverId: this.server.id
    };

    let dialogData = {
      data: deleteDetails,
      title: this._translateService.instant('dialogDeleteServerSingle.title'),
      message: this._translateService.instant('dialogDeleteServerSingle.message'),
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
    // TODO: Check if userId is still necessary in resetting server password?
    // or can we use the credentials of the job itself
    let resetDetails = new McsServerPasswordReset();
    resetDetails.clientReferenceObject = {
      serverId: this.server.id
    };

    let messageContentByState = this.server.isPoweredOff ?
      this._translateService.instant('dialogResetPassword.poweredOffMessage', { server_name: this.server.name }) :
      this._translateService.instant('dialogResetPassword.poweredOnMessage', { server_name: this.server.name });

    let dialogData = {
      data: resetDetails,
      title: this._translateService.instant('dialogResetPassword.title'),
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
    this._eventDispatcher.dispatch(McsEvent.serverScaleManageSelected, this.server);
    this._navigationService.navigateTo(RouteKey.OrderServerManagedScale);
  }

  /**
   * View the server in vcloud
   */
  private _viewServerInVCloud(): void {
    window.open(this.server.portalUrl);
  }
}
