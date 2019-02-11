import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  Observable,
  of,
  Subscription
} from 'rxjs';
import {
  animateFactory,
  McsStatusType,
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import {
  CoreDefinition,
  McsScrollDispatcherService
} from '@app/core';
import {
  EventBusDispatcherService,
  EventBusState
} from '@app/event-bus';
import { FormMessage } from './form-message';
import { ComponentHandlerDirective } from '../directives';

@Component({
  selector: 'mcs-form-message',
  templateUrl: './form-message.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'form-message-wrapper',
    '[class.hide-element]': 'hidden'
  }
})

export class FormMessageComponent implements OnInit, OnDestroy, FormMessage {
  @Input()
  public type: McsStatusType = 'success';

  public messages$: Observable<string[]>;
  public hidden: boolean = true;
  public hasCustomMessage: boolean = false;

  @ViewChild(ComponentHandlerDirective)
  private _alertMessage: ComponentHandlerDirective;
  private _changeRouteHandler: Subscription;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef<HTMLElement>,
    private _eventbusService: EventBusDispatcherService,
    private _scrollElementService: McsScrollDispatcherService
  ) { }

  public ngOnInit() {
    this._changeRouteHandler = this._eventbusService.addEventListener(
      EventBusState.RouteChange, this._onRouteChange.bind(this)
    );
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._changeRouteHandler);
  }

  public get bulletIconKey(): string {
    return CoreDefinition.ASSETS_FONT_BULLET;
  }

  /**
   * Shows the message based on the message strings
   */
  public showMessage(...messages: string[]): void {
    this.messages$ = of(messages);
    this.hasCustomMessage = !isNullOrEmpty(messages);
    this.hidden = false;

    Promise.resolve().then(() => {
      if (!isNullOrEmpty(this._alertMessage)) {
        this._alertMessage.recreateComponent();
      }
    });
    this._scrollElementService.scrollToElement(this._elementRef.nativeElement);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Hides the form message from the implementation
   */
  public hideMessage(): void {
    this.hidden = true;
    Promise.resolve().then(() => {
      if (!isNullOrEmpty(this._alertMessage)) {
        this._alertMessage.removeComponent();
      }
    });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that gets notified once there are changes on the route
   */
  private _onRouteChange(): void {
    this.hideMessage();
  }
}
