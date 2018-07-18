import {
  Component,
  Input,
  Renderer2,
  ElementRef,
  ViewChild,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import {
  Subscription,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CoreDefinition,
  McsSizeType,
  McsPlacementType
} from '../../core';
import {
  animateFactory,
  isNullOrEmpty,
  unsubscribeSubject,
  getSafeProperty,
  clearArrayRecord
} from '../../utilities';
import { ComponentHandlerDirective } from '../directives';
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
    'class': 'loader-wrapper',
    '[id]': 'id'
  }
})

export class LoaderComponent implements AfterViewInit, OnDestroy {
  @Input()
  public id: string = `mcs-loader-${nextUniqueId++}`;

  @Input()
  public get subscriptions(): Subscription | Subscription[] { return this._subscriptions; }
  public set subscriptions(value: Subscription | Subscription[]) {
    if (this._subscriptions !== value) {
      this._subscriptions = value;
      this._loaderService.setSubscribers(this.subscriptions);
    }
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

  @ViewChild(ComponentHandlerDirective)
  private _loaderComponentHandler: ComponentHandlerDirective;

  @ViewChild('targetElements')
  private _targetElement: ElementRef<any>;
  private _targetElements: Element[];

  private _destroySubject = new Subject<void>();
  private _loaderIsVisible: boolean = true;

  public constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _loaderService: LoaderService
  ) {
    this._targetElements = new Array();
  }

  public ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this._setTargetElements();
      this._listenToSubscriptionsChanges();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns the spinner icon key as string
   */
  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  /**
   * Returns the host element reference
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Listens for every subscriptions changes
   */
  private _listenToSubscriptionsChanges(): void {
    this._loaderService.subscriptionsChange
      .pipe(takeUntil(this._destroySubject))
      .subscribe((_subscriptions) => {
        let content = getSafeProperty(_subscriptions, (obj) => obj.size);
        isNullOrEmpty(content) ? this._hideLoader() : this._showLoader();
      });
  }

  /**
   * Shows the loader
   */
  private _showLoader(): void {
    if (this._loaderIsVisible) { return; }

    Promise.resolve().then(() => {
      this._hideTargetElements();
      this._loaderComponentHandler.createComponent();
      this._loaderIsVisible = true;
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Hides the loader when all the subscriptions are done
   */
  private _hideLoader(): void {
    if (!this._loaderIsVisible) { return; }

    Promise.resolve().then(() => {
      this._showTargetElements();
      this._loaderComponentHandler.removeComponent();
      this._loaderIsVisible = false;
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
  }

  /**
   * Sets the target element for reference
   */
  private _setTargetElements(): void {
    if (isNullOrEmpty(this._targetElement)) { return; }
    let targetElement = this._targetElement.nativeElement as HTMLElement;
    clearArrayRecord(this._targetElements);

    for (let elementIdx = 0; elementIdx < targetElement.children.length; elementIdx++) {
      let childElement = targetElement.children.item(elementIdx);
      if (isNullOrEmpty(childElement)) { continue; }
      this._targetElements.push(childElement);
    }
  }
}
