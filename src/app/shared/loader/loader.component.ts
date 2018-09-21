import {
  Component,
  Input,
  Renderer2,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  Subscription,
  Subject
} from 'rxjs';
import {
  takeUntil,
  startWith
} from 'rxjs/operators';
import { CoreDefinition } from '@app/core';
import {
  animateFactory,
  isNullOrEmpty,
  unsubscribeSubject,
  clearArrayRecord,
  refreshView,
  McsSizeType,
  McsPlacementType
} from '@app/utilities';
import { LoaderService } from './loader.service';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    LoaderService
  ],
  animations: [
    animateFactory.fadeOut
  ],
  host: {
    '[id]': 'id',
    'class': 'loader-wrapper'
  }
})

export class LoaderComponent implements AfterViewInit, OnDestroy {
  @Input()
  public id: string = `mcs-loader-${nextUniqueId++}`;

  @Input()
  public get subscriptions(): Subscription | Subscription[] { return this._subscriptions; }
  public set subscriptions(value: Subscription | Subscription[]) {
    this._subscriptions = value;
    this._loaderService.setSubscribers(this._subscriptions);
  }
  private _subscriptions: Subscription | Subscription[];

  @Input()
  public get loadingText(): string { return this._loadingText; }
  public set loadingText(value: string) { this._loadingText = value; }
  private _loadingText: string;

  @Input()
  public get loadingPlacement(): McsPlacementType { return this._loadingPlacement; }
  public set loadingPlacement(value: McsPlacementType) { this._loadingPlacement = value; }
  private _loadingPlacement: McsPlacementType;

  @Input()
  public get iconSize(): McsSizeType { return this._iconSize; }
  public set iconSize(value: McsSizeType) { this._iconSize = value; }
  private _iconSize: McsSizeType = 'large';

  @ViewChild('targetElements')
  private _targetElement: ElementRef<any>;
  private _targetElements: Element[];

  private _destroySubject = new Subject<void>();
  private _targetElementsAreVisible = false;

  public constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _loaderService: LoaderService
  ) {
    this._targetElements = new Array();
  }

  public ngAfterViewInit(): void {
    refreshView(() => {
      this._listenToActiveChanges();
      this._listenToSubscriptionsChanges();
      if (!this.subscriptionsActive) { this._showTargetElements(); }
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns true when there is an active subscriptions
   */
  public get subscriptionsActive(): boolean {
    return this._loaderService.isActive();
  }

  /**
   * Returns the spinner icon key as string
   */
  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
  }

  /**
   * Returns the host element reference
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Event that emits when the loader animation starts
   */
  public onLoaderAnimationStart(): void {
    if (!this._targetElementsAreVisible) { return; }
    Promise.resolve().then(() => this._hideTargetElements());
  }

  /**
   * Event that emits when the loader animation ended
   */
  public onLoaderAnimationDone(): void {
    if (this._targetElementsAreVisible) { return; }
    Promise.resolve().then(() => this._showTargetElements());
  }

  /**
   * Listens for every subscriptions changes
   */
  private _listenToSubscriptionsChanges(): void {
    this._loaderService.subscriptionsChange
      .pipe(takeUntil(this._destroySubject))
      .subscribe((_subscriptions) => this._changeDetectorRef.markForCheck());
  }

  /**
   * Listens for every active changes on the loader
   */
  private _listenToActiveChanges(): void {
    this._loaderService.activeChange
      .pipe(startWith(true), takeUntil(this._destroySubject))
      .subscribe((isActive) => {
        if (isActive) { this._setTargetElements(); }
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Creates the target element view by it's template
   */
  private _showTargetElements(): void {
    let noTargetElements = isNullOrEmpty(this.hostElement) || isNullOrEmpty(this._targetElements);
    if (noTargetElements) { return; }
    this._targetElements.forEach((element) => {
      this._renderer.insertBefore(
        this.hostElement.parentNode,
        element,
        this.hostElement
      );
    });
    this._targetElementsAreVisible = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Destroys the target element view
   */
  private _hideTargetElements(): void {
    let noTargetElements = isNullOrEmpty(this.hostElement) || isNullOrEmpty(this._targetElements);
    if (noTargetElements) { return; }
    this._targetElements.forEach((element) => {
      this._renderer.appendChild(this._targetElement.nativeElement, element);
    });
    this._targetElementsAreVisible = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the target element for reference
   */
  private _setTargetElements(): void {
    let targetElementsObtained = isNullOrEmpty(this._targetElement)
      || !isNullOrEmpty(this._targetElements);
    if (targetElementsObtained) { return; }

    let targetElement = this._targetElement.nativeElement as HTMLElement;
    clearArrayRecord(this._targetElements);

    for (let elementIdx = 0; elementIdx < targetElement.children.length; elementIdx++) {
      let childElement = targetElement.children.item(elementIdx);
      if (isNullOrEmpty(childElement)) { continue; }
      this._targetElements.push(childElement);
    }
  }
}
