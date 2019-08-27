import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  unsubscribeSafely,
  CommonDefinition,
  isNullOrEmpty,
  deleteArrayRecord,
  Guid
} from '@app/utilities';
import { McsEvent } from '@app/events';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

interface ErrorDetails {
  id: string;
  errorMessage: string;
}

@Component({
  selector: 'mcs-error-notification',
  templateUrl: './error-notification.component.html',
  styleUrls: ['./error-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'error-notification-wrapper'
  }
})

export class ErrorNotificationComponent implements OnDestroy {
  public errorList: ErrorDetails[];

  private _errorShowHandler: Subscription;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventBusDispatcher: EventBusDispatcherService
  ) {
    this.errorList = new Array();
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._errorShowHandler);
  }

  /**
   * Returns all the close icon key
   */
  public get closeIconkey(): string {
    return CommonDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  /**
   * Event that emits when the close button of the error message has been clicked
   * @param errorDetails Error to be closed
   */
  public onCloseError(errorDetails: ErrorDetails): void {
    if (isNullOrEmpty(errorDetails)) { return; }
    deleteArrayRecord(this.errorList, (item) => item.id === errorDetails.id);
  }

  /**
   * Registers all the associated events
   */
  private _registerEvents(): void {
    this._errorShowHandler = this._eventBusDispatcher.addEventListener(
      McsEvent.errorShow, this._onErrorShow.bind(this));
  }

  /**
   * Event that emits when an error has been displayed
   * @param message Message to be displayed
   */
  private _onErrorShow(message: string): void {
    this.errorList.push({
      id: Guid.newGuid().toString(),
      errorMessage: message
    });
    this._changeDetectorRef.markForCheck();
  }
}
