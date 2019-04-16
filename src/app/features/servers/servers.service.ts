import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  CoreRoutes,
  McsAuthenticationIdentity,
  McsDialogService,
  CoreEvent
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  ServerCommand,
  RouteKey,
  McsServer,
  McsJob,
  JobType,
  DataStatus,
  VmPowerstateCommand
} from '@app/models';
import { McsServersRepository } from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
import { ResetPasswordFinishedDialogComponent } from '@app/features-shared';

@Injectable()
export class ServersService {

  constructor(
    private _serversRepository: McsServersRepository,
    private _eventDispatcher: EventBusDispatcherService,
    private _authIdentity: McsAuthenticationIdentity,
    private _dialogService: McsDialogService,
    private _router: Router
  ) {
    this._registerEvents();
  }

  /**
   * Execute the server command according to inputs
   * @param data Data of the server to process the action
   * @param action Action to be execute
   */
  public executeServerCommand(
    data: { server: McsServer, result?: any },
    action: ServerCommand
  ) {

    switch (action) {
      case ServerCommand.ViewVCloud:
        window.open(data.server.portalUrl);
        break;

      case ServerCommand.Scale:
        this._router.navigate([
          CoreRoutes.getNavigationPath(RouteKey.Servers),
          data.server.id,
          CoreRoutes.getNavigationPath(RouteKey.ServerDetailsManagement)
        ], { queryParams: { scale: true } }
        );
        break;

      case ServerCommand.Clone:
        this._router.navigate(
          [CoreRoutes.getNavigationPath(RouteKey.ServerCreate)],
          { queryParams: { clone: data.server.id } }
        );
        break;

      case ServerCommand.ResetVmPassword:
        this.setServerSpinner(data.server);
        this._serversRepository.resetVmPassword(data.server.id,
          {
            serverId: data.server.id,
            userId: this._authIdentity.user.userId,
            commandAction: action,
            powerState: data.server.powerState,
          })
          .pipe(
            catchError((error) => {
              this.clearServerSpinner(data.server);
              return throwError(error);
            })
          )
          .subscribe(() => {
            // Subscribe to execute the reset vm password
          });
        break;

      case ServerCommand.Delete:
        this.setServerSpinner(data.server);
        this._serversRepository.deleteServer(data.server.id,
          {
            serverId: data.server.id,
            commandAction: action,
            powerState: data.server.powerState
          })
          .pipe(
            catchError((error) => {
              this.clearServerSpinner(data.server);
              return throwError(error);
            })
          ).subscribe();
        this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Servers)]);
        break;

      case ServerCommand.Rename:
        this.setServerSpinner(data.server);
        this._serversRepository.renameServer(data.server.id,
          {
            name: data.result,    // Server name
            clientReferenceObject: {
              serverId: data.server.id,
              commandAction: action,
              powerState: data.server.powerState,
              newName: data.result
            }
          })
          .pipe(
            catchError((error) => {
              this.clearServerSpinner(data.server);
              return throwError(error);
            })
          ).subscribe();
        break;

      default:
        this.setServerSpinner(data.server);
        this._serversRepository.sendServerPowerState(data.server.id, {
          command: VmPowerstateCommand[ServerCommand[action]],
          clientReferenceObject: {
            serverId: data.server.id
          }
        }).pipe(
          catchError((error) => {
            this.clearServerSpinner(data.server);
            return throwError(error);
          })
        ).subscribe();
        break;
    }
  }

  /**
   * Set the server status to inprogress to display the spinner of corresponding server
   * @param server Server to be set as processing
   * @param classes Additional classed to set their isProcessing flag
   */
  public setServerSpinner(server: McsServer, ...classes: any[]): void {
    this._setServerExecutionStatus(server, true, ...classes);
  }

  /**
   * Clear the server status to hide the spinner of corresponding server
   * @param server Server to be set as processing
   * @param classes Additional classed to set their isProcessing flag
   */
  public clearServerSpinner(server: McsServer, ...classes: any[]): void {
    this._setServerExecutionStatus(server, false, ...classes);
  }

  /**
   * Set the server execution based on status in order for the
   * server to load first while waiting for the corresponding job
   * @param server Server to be set as processing
   * @param classes Additional classed to set their isProcessing flag
   */
  private _setServerExecutionStatus(
    server: McsServer,
    status: boolean = true,
    ...classes: any[]
  ): void {
    if (isNullOrEmpty(server)) { return; }
    server.isProcessing = status;
    server.processingText = 'Processing request.';

    // Additional instance to set the process flag
    if (!isNullOrEmpty(classes)) {
      classes.forEach((param) => {
        if (isNullOrEmpty(param)) {
          param = Object.create(param);
          param.isProcessing = status;
        } else {
          param.isProcessing = status;
        }
      });
    }
  }

  /**
   * Listens to current user job to trigger the dialog box
   * when the reset vm password has finished
   */
  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      CoreEvent.jobServerResetPassword, this._onResetVmPassword.bind(this));
  }

  /**
   * Event that emits when vm password has been received
   */
  private _onResetVmPassword(job: McsJob): void {
    let jobIsResetVmPassword = getSafeProperty(job, (obj) => obj.type) === JobType.ResetServerPassword;
    if (!jobIsResetVmPassword) { return; }

    if (job.dataStatus === DataStatus.Success) {
      let credentialObject = job.tasks[0].referenceObject.credential;
      this._dialogService.open(ResetPasswordFinishedDialogComponent, {
        id: 'reset-vm-password-confirmation',
        data: credentialObject,
        size: 'medium',
        disableClose: true
      });
    }
  }
}
