import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {
  Server,
  ServerServiceType
} from '../../models';
import { isNullOrEmpty } from '../../../../utilities';

@Directive({
  selector: '[mcsIsSelfManagedServer]'
})

export class IsSelfManagedServerDirective {

  @Input('mcsIsSelfManagedServer')
  public get server(): Server {
    return this._server;
  }
  public set server(value: Server) {
    if (this._server !== value) {
      this._server = value;
      this._createView(this._server);
    }
  }
  private _server: Server;

  constructor(
    public templateRef: TemplateRef<any>,
    public viewContainer: ViewContainerRef
  ) { }

  private _createView(server: Server): void {
    if (isNullOrEmpty(server)) { return; }

    this.viewContainer.clear();
    if (server.serviceType === ServerServiceType.SelfManaged) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
