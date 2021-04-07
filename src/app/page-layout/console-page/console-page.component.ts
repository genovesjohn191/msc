import {
  of,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  map,
  share,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsServer,
  McsServerPowerstateCommand,
  VmPowerstateCommand,
  VmPowerState
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DialogConfirmation,
  DialogService
} from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  KeyboardKey
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ConsoleStatus } from './console-status';
import { IConsolePageEntity } from './factory/console-page-entity.interface';
import { ConsolePageFactory } from './factory/console-page-factory';

const CLOSING_DEFAULT_TIME_IN_SECONDS = 3;

@Component({
  selector: 'mcs-console-page',
  templateUrl: './console-page.component.html',
  styleUrls: ['./console-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'console-page-wrapper'
  }
})

export class ConsolePageComponent implements AfterViewInit, OnDestroy {
  public serverDetails$: Observable<McsServer>;
  public closingTime: number;
  public isConsoleClose: boolean;
  public pasteTextValue: string;
  public isPasswordType: boolean;

  @ViewChild('consoleUiElement')
  public consoleUiElement: ElementRef;

  @ViewChild('popoverActionElement')
  public popoverActionElement: any;

  private _intervalId: number;
  private _destroySubject: Subject<void>;
  private _serverStateChange: Subject<VmPowerState>;
  private _serversDataChangeHandler: Subscription;
  private _accountChangeHandler: Subscription;

  private _consolePageFactory: ConsolePageFactory;
  private _consolePageInstance: IConsolePageEntity;
  private _consoleServerInstance: McsServer;

  public constructor(
    private _apiService: McsApiService,
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _eventDispatcher: EventBusDispatcherService,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.closingTime = CLOSING_DEFAULT_TIME_IN_SECONDS;
    this._serverStateChange = new Subject();
    this._destroySubject = new Subject();
    this._consolePageFactory = new ConsolePageFactory();
    this._registerEventHandlers();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._subscribeToServerState();
      this._subscribeToServerDetails();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._accountChangeHandler);
    unsubscribeSafely(this._serversDataChangeHandler);
  }

  public get consoleStatusEnum() {
    return ConsoleStatus;
  }

  public get keyboardIconKey(): string {
    return CommonDefinition.ASSETS_SVG_KEYBOARD;
  }

  public get startIconKey(): string {
    return CommonDefinition.ASSETS_SVG_START;
  }

  public get restartIconKey(): string {
    return CommonDefinition.ASSETS_SVG_RESTART;
  }

  public get stopIconKey(): string {
    return CommonDefinition.ASSETS_SVG_STOP;
  }

  public get clipboardIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLIPBOARD;
  }

  public get stoppingText(): string {
    return this._translateService.instant(
      'consolePage.stopping', { timer: this.closingTime.toString() }
    );
  }

  /**
   * An observable event that emtis when the status of the console has been changed
   */
  public get stateChange(): Observable<ConsoleStatus> {
    return getSafeProperty(this._consolePageInstance, (obj) => obj.consoleStateChange(), of(null));
  }

  /**
   * Returns true when the console can be controlled
   */
  public get isControllable(): boolean {
    return getSafeProperty(this._consolePageInstance, (obj) => obj.isControllable(), false);
  }

  /**
   * Returns true when the paste text area is empty, false otherwise
   */
  public isPasteTextEmpty(pasteText: string): boolean {
    return isNullOrEmpty(getSafeProperty(pasteText, (obj) => obj.trim()));
  }

  /**
   * Event that emits when send request for control + alt + delete is clicked
   */
  public onClickCtrlAltDelete() {
    if (isNullOrEmpty(this._consolePageInstance)) {
      throw new Error('Unable to send keys of undefined console instance.');
    }
    this._consolePageInstance.sendKeyCodes([
      KeyboardKey.Ctrl,
      KeyboardKey.Alt,
      KeyboardKey.Delete
    ]);
  }

  /**
   * Event that emits when send request for paste text is clicked
   */
  public onPasteText(pasteText: string) {
    if (isNullOrEmpty(this._consolePageInstance)) {
      throw new Error('Unable to send string value to undefined console instance.');
    }
    if (this.popoverActionElement) { this.popoverActionElement.close(); }
    this._consolePageInstance.sendInputString(pasteText);
    this._resetPasteTextControls();
    if (!isNullOrEmpty(this.consoleUiElement.nativeElement)) {
      this.consoleUiElement.nativeElement.focus();
    }
  }

  /**
   * Stops the server of the opened console
   * @param server Server to be started
   */
  public stopServer(server: McsServer): void {

    let powerStateDetails = new McsServerPowerstateCommand();
    powerStateDetails.command = VmPowerstateCommand.PowerOff;
    powerStateDetails.clientReferenceObject = {
      serverId: server.id
    };

    let dialogData = {
      data: powerStateDetails,
      title: this._translateService.instant('dialogStopServerSingle.title'),
      message: this._translateService.instant('dialogStopServerSingle.message', { server_name: server.name }),
      type: 'info'
    } as DialogConfirmation<McsServerPowerstateCommand>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }

        if (!isNullOrEmpty(this._consolePageInstance)) {
          this._consolePageInstance.disconnect();
        }

        return this._apiService.sendServerPowerState(server.id, powerStateDetails).pipe(
          tap(() => {
            this.isConsoleClose = true;
            this._changeDetectorRef.markForCheck();
            if (!isNullOrEmpty(this._intervalId)) { clearInterval(this._intervalId); }
            this._intervalId = window.setInterval(this._closeWindow.bind(this), 1000);
          })
        );
      })
    ).subscribe();
  }

  /**
   * Restarts the server of the opened console
   * @param server Server to be restarted
   */
  public restartServer(server: McsServer): void {
    if (!isNullOrEmpty(this._consolePageInstance)) {
      this._consolePageInstance.disconnect();
    }

    let powerStateDetails = new McsServerPowerstateCommand();
    powerStateDetails.command = VmPowerstateCommand.Restart;
    powerStateDetails.clientReferenceObject = {
      serverId: server.id
    };

    this._apiService.sendServerPowerState(server.id, powerStateDetails).subscribe();
  }

  /**
   * Registers the event handlers
   */
  private _registerEventHandlers() {
    this._accountChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.accountChange, this._onAccountChanged.bind(this));

    this._serversDataChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.dataChangeServers, this._onServersDataChanged.bind(this));
  }

  /**
   * Event that emits when the account has been changed
   */
  private _onAccountChanged(): void {
    this.closingTime = 0;
    this._closeWindow();
  }

  /**
   * Event that emits when the servers data has been changed
   * @param servers Updated server list
   */
  private _onServersDataChanged(servers: McsServer[]): void {
    if (isNullOrEmpty(this._consoleServerInstance)) { return; }

    let currentServer = servers && servers.find((server) => server.id === this._consoleServerInstance.id);
    let currentServerIsBusy = currentServer && currentServer.isProcessing;
    if (currentServerIsBusy || isNullOrEmpty(currentServer)) { return; }

    this._serverStateChange.next(this._consoleServerInstance.powerState);
  }

  /**
   * Close the window within the specified time
   */
  private _closeWindow(): void {
    if (this.closingTime > 0) {
      --this.closingTime;
      this._changeDetectorRef.markForCheck();
      return;
    }
    window.close();
  }

  /**
   * Subscribes to server state change event
   */
  private _subscribeToServerState(): void {
    this._serverStateChange.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged(),
      tap(() => {
        this._consoleServerInstance.isPoweredOff ?
          this._consolePageInstance.disconnect() :
          this._getServerConsole(this._consoleServerInstance.id);
        this._changeDetectorRef.markForCheck();
      })
    ).subscribe();
  }

  /**
   * Subscribes to server details
   */
  private _subscribeToServerDetails(): void {
    this.serverDetails$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.server)),
      tap((server: McsServer) => {
        this._consoleServerInstance = server;
        this._consolePageInstance = this._consolePageFactory.getConsoleFactory(server.platform.type);
        this._getServerConsole(server.id);
      }),
      shareReplay(1)
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Gets the server console based on the server id
   * @param serverId Server id of the server to be obtained
   */
  private _getServerConsole(serverId: string) {
    if (isNullOrEmpty(serverId)) { return; }
    this._apiService.getServerConsole(serverId).pipe(
      share(),
      tap((consoleDetails) => this._consolePageInstance
        .connect(consoleDetails, this.consoleUiElement.nativeElement)
      )
    ).subscribe();
  }

  /**
   * Defaults the value of the Paste Text controLS
   */
  private _resetPasteTextControls(): void {
    this.pasteTextValue = '';
    this.isPasswordType = false;
  }
}
