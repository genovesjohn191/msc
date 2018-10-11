import {
  Directive,
  Input,
  Inject,
  forwardRef,
  Output,
  EventEmitter
} from '@angular/core';
import {
  McsActionType,
  isNullOrEmpty
} from '@app/utilities';
import { AlertComponent } from './alert.component';

@Directive({
  selector: '[mcsAlertAction]',
  host: {
    'class': 'alert-action-wrapper',
    '(click)': 'executeAction()'
  }
})
export class AlertActionDirective {
  @Input('mcsAlertAction')
  public actionType: McsActionType;

  @Output('execute')
  public execute: EventEmitter<AlertComponent>;

  private _eventActionMap: Map<McsActionType, () => void>;

  constructor(@Inject(forwardRef(() => AlertComponent)) private _alertComponent) {
    this._eventActionMap = new Map();
    this.execute = new EventEmitter();
    this._registerEventActions();
  }

  /**
   * Execute the action when clicked
   */
  public executeAction(): void {
    let userAction = this._eventActionMap.get(this.actionType);
    if (isNullOrEmpty(userAction)) {
      throw Error(`${this.actionType} action was not registered on the current context.`);
    }
    userAction();
  }

  /**
   * Registers all corresponding events and their associated method
   */
  private _registerEventActions(): void {
    this._eventActionMap.set('dismiss', this._hideAlertAction.bind(this));
    this._eventActionMap.set('proceed', this._executeCommand.bind(this));
  }

  /**
   * Hide the alert action with animation
   */
  private _hideAlertAction(): void {
    this._alertComponent.hideAlert();
  }

  /**
   * Execute the command action registered on the output parameter event
   */
  private _executeCommand(): void {
    this.execute.emit(this._alertComponent);
  }
}
