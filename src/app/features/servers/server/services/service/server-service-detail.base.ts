import {
  EventEmitter,
  Output,
  Input
} from '@angular/core';
import {
  ServerServicesView,
  McsServer,
  McsJob
} from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';

export abstract class ServerServiceDetailBase {

  @Input()
  public set server(server: McsServer) {
    this._server = server;
  }
  public get server(): McsServer {
    return this._server;
  }

  @Output()
  public viewChange: EventEmitter<ServerServicesView>;

  private _serviceView: ServerServicesView;
  private _server: McsServer;

  constructor(serviceView: ServerServicesView) {
    this.viewChange = new EventEmitter();
    this._serviceView = serviceView;
  }

  /**
   * Emits the value of the service view
   */
  public changeView(): void {
    this.viewChange.emit(this._serviceView);
  }

  /**
   * Returns true when the server is activated by job process
   * @param job Emitted job to be checked
   */
  protected serverIsActiveByJob(job: McsJob): boolean {
    if (isNullOrEmpty(job) || isNullOrEmpty(this._server.id)) { return false; }
    return getSafeProperty(job, (obj) => obj.clientReferenceObject.serverId) === this._server.id;
  }
}
