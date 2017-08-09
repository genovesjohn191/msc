import { Injectable } from '@angular/core';
import {
  ContextualHelpDirective
} from '../shared/contextual-help/contextual-help.directive';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class CreateSelfManagedServerService {

  /**
   * Subscribe to this stream to get all the contextual help directives from the
   * child (router) component and display in the main view
   */
  private _contextualHelpStream: BehaviorSubject<ContextualHelpDirective[]>;
  public get contextualHelpStream(): BehaviorSubject<ContextualHelpDirective[]> {
    return this._contextualHelpStream;
  }
  public set contextualHelpStream(value: BehaviorSubject<ContextualHelpDirective[]>) {
    this._contextualHelpStream = value;
  }

  constructor() {
    this._contextualHelpStream = new BehaviorSubject<ContextualHelpDirective[]>(undefined);
  }

  public getDeploymentData() {
    // TODO: Return deployment information here
    return undefined;
  }
}
