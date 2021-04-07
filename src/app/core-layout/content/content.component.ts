import {
  Subject,
  Subscription
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { McsBrowserService } from '@app/core/services/mcs-browser.service';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  Breakpoint,
  McsRouteInfo
} from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

@Component({
  selector: 'mcs-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})

export class ContentComponent implements OnInit, OnDestroy, AfterViewInit {
  public title: string;
  public showNav: boolean = false;
  public deviceType: Breakpoint;

  private _routeHandler: Subscription;
  private _navToggleHandler: Subscription;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _browserService: McsBrowserService
  ) {
    this.title = 'Content component';
    this.deviceType = Breakpoint.Large;
  }

  public ngAfterViewInit(): void {
    let desktopMode = this.deviceType >= Breakpoint.Medium;

    // Show navigation by default
    if (desktopMode) {
      this._navToggle();
    }
  }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._routeHandler);
    unsubscribeSafely(this._navToggleHandler);
  }

  private _registerEvents(): void {
    this._routeHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChanged.bind(this));

    this._navToggleHandler = this._eventDispatcher.addEventListener(
      McsEvent.navToggle, this._navToggle.bind(this));

    this._subscribeToBrowserResize();
  }

  private _subscribeToBrowserResize(): void {
    this._browserService.breakpointChange()
      .pipe(takeUntil(this._destroySubject))
      .subscribe((deviceType: Breakpoint) => {
        this.deviceType = deviceType;
        this._changeDetectorRef.markForCheck();
      });
  }

  private _navToggle(): void {
    this.showNav = !this.showNav;
    this._changeDetectorRef.markForCheck();
  }

  private _onRouteChanged(routeInfo: McsRouteInfo): void {
    let desktopMode = this.deviceType >= Breakpoint.Medium;
    if (isNullOrEmpty(routeInfo) || desktopMode) { return; }

    this.showNav = false;
    this._changeDetectorRef.markForCheck();
  }

  public toggleNav(): void {
    this._eventDispatcher.dispatch(McsEvent.navToggle);
  }
}
