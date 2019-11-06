import {
  EventEmitter,
  Output
} from '@angular/core';
import { ServerServicesView } from '@app/models';

export abstract class ServiceDetailViewBase {

  @Output()
  public viewChange: EventEmitter<ServerServicesView>;

  private _serviceView: ServerServicesView;

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
}
