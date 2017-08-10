import { Injectable } from '@angular/core';
import {
  ContextualHelpDirective
} from '../shared/contextual-help/contextual-help.directive';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class CreateSelfManagedServersService {

  /**
   * Sub contextual help to all the components which are
   * dynamically created during runtime
   */
  private _subContextualHelp: ContextualHelpDirective[];
  public get subContextualHelp(): ContextualHelpDirective[] {
    return this._subContextualHelp;
  }
  public set subContextualHelp(value: ContextualHelpDirective[]) {
    this._subContextualHelp = value;
  }

  constructor() {
    this._subContextualHelp = new Array();
  }

  public getDeploymentData() {
    // TODO: Return deployment information here
    return undefined;
  }
}
