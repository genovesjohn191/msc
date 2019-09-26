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
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import { McsScrollDispatcherService } from '@app/core';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import {
  FormMessage,
  FormMessageContent
} from './form-message';
import { ComponentHandlerDirective } from '../directives';
import { FormMessageConfig } from './form-message.config';

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
  public messages$: Observable<string[]>;
  public type: McsStatusType;
  public hidden: boolean = true;
  public showBullet: boolean = false;

  @Input()
  public config: FormMessageConfig;

  @ViewChild(ComponentHandlerDirective, { static: false })
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
      McsEvent.routeChange, this._onRouteChange.bind(this)
    );
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._changeRouteHandler);
  }

  public get bulletIconKey(): string {
    return CommonDefinition.ASSETS_SVG_BULLET;
  }

  /**
   * Shows the message based on the message strings
   */
  public showMessage(messageType: McsStatusType, messageContent: FormMessageContent): void {
    if (isNullOrEmpty(messageContent)) {
      throw new Error('Form message content is not defined.');
    }

    // Set form attributes
    this.type = messageType;
    this.hidden = false;
    this._setFormMessageContent(messageContent);

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
   * Updates the configuration of the form message
   * @param config Configuration to be applied
   */
  public updateConfiguration(newConfig: FormMessageConfig): void {
    this.config = newConfig;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that gets notified once there are changes on the route
   */
  private _onRouteChange(): void {
    this.hideMessage();
  }

  /**
   * Sets the form message contents
   * @param messageContent Message content to be set on the form component
   */
  private _setFormMessageContent(messageContent: FormMessageContent): void {
    let formMessages: string[] = !(messageContent.messages instanceof Array) ?
      [messageContent.messages] : messageContent.messages;

    this.showBullet = !isNullOrEmpty(messageContent.messages) && messageContent.messages.length > 1;
    this.messages$ = isNullOrEmpty(formMessages) ?
      of([messageContent.fallbackMessage]) : of(formMessages);
  }
}
