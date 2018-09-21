import {
  Input,
  Directive,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2,
  ViewContainerRef,
  NgZone
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsGlobalElementRef,
  McsGlobalElementOption,
  McsGlobalElementService,
  McsPortalComponent
} from '@app/core';
import {
  isNullOrEmpty,
  coerceBoolean,
  unsubscribeSubject
} from '@app/utilities';
import { ContextualHelpComponent } from './contextual-help.component';

@Directive({
  selector: '[mcsContextualHelp]',
  host: {
    '(focus)': 'show()',
    '(blur)': 'hide()'
  },
  exportAs: 'mcsContextualHelp'
})

export class ContextualHelpDirective implements OnInit, OnDestroy {
  /**
   * Contextual help message to be displayed
   */
  @Input('mcsContextualHelp')
  public get message(): string { return this._message; }
  public set message(value: string) {
    if (this._message !== value) {
      this._message = value;
      this._setMessage(value);
    }
  }
  private _message: string;

  /**
   * Condition when contextual help should be visible the whole time
   */
  @Input('mcsContextualHelpVisible')
  public get visible(): boolean { return this._visible; }
  public set visible(value: boolean) {
    if (this._visible !== value) {
      this._visible = coerceBoolean(value);
    }
  }
  private _visible: boolean = true;

  // Others declaration
  private _globalElementRef: McsGlobalElementRef | null;
  private _contextualHelpInstance: ContextualHelpComponent | null;
  private _destroySubject = new Subject<any>();

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
    private _globalElementService: McsGlobalElementService
  ) { }

  public ngOnInit(): void {
    this._setTabIndex();
    this._moveContextualHelpToHost();
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
    if (this._contextualHelpInstance) {
      this._disposeContextualHelp();
    }
  }

  /**
   * Show the contextual help
   */
  public show(): void {
    if (!this._visible) { return; }
    if (isNullOrEmpty(this._contextualHelpInstance)) {
      this._createContextualHelp();
    }
    this._setMessage(this._message);
    this._contextualHelpInstance!.show();
  }

  /**
   * Hide the contextual help
   */
  public hide(_delay: number = 0): void {
    if (!isNullOrEmpty(this._contextualHelpInstance)) {
      this._contextualHelpInstance.hide(_delay);
    }
  }

  /**
   * Set the tool message and notify view for changes
   * @param message Message of the contextual help to be displayed
   */
  private _setMessage(message: string): void {
    if (isNullOrEmpty(this._contextualHelpInstance)) { return; }
    this._contextualHelpInstance.message = message;
    this._contextualHelpInstance.markForCheck();
  }

  /**
   * Create the contextual help component including the global element wrapper
   */
  private _createContextualHelp(): void {
    this._globalElementRef = this._createGlobalElementWrapper();
    let portal = new McsPortalComponent(ContextualHelpComponent, this._viewContainerRef);
    this._contextualHelpInstance = this._globalElementRef.attachComponent(portal).instance;

    // Close the contextual help when the animation ended
    this._contextualHelpInstance!.afterHidden().subscribe(() => {
      if (!isNullOrEmpty(this._contextualHelpInstance)) {
        this._disposeContextualHelp();
      }
    });
  }

  /**
   * Dispose the current displayed contextual help
   */
  private _disposeContextualHelp(): void {
    if (!isNullOrEmpty(this._globalElementRef)) {
      this._globalElementRef.dispose();
      this._globalElementRef = null;
    }
    this._contextualHelpInstance = null;
  }

  /**
   * Create the overlay of the contextual help
   */
  private _createGlobalElementWrapper(): McsGlobalElementRef {
    let globalElementRef: McsGlobalElementRef;
    let globalElementOption = new McsGlobalElementOption();

    // Create overlay element
    globalElementOption.pointerEvents = 'auto';
    globalElementRef = this._globalElementService.create(globalElementOption);
    globalElementRef.moveElementTo({
      hostElement: this._elementRef.nativeElement,
      placement: 'right-top'
    });
    return globalElementRef;
  }

  /**
   * Moves the contextual help relative to host element
   */
  private _moveContextualHelpToHost(): void {
    this._ngZone.onStable.pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        if (isNullOrEmpty(this._globalElementRef)) { return; }
        this._globalElementRef.moveElementTo({
          hostElement: this._elementRef.nativeElement,
          placement: 'right-top'
        });
      });
  }

  /**
   * Set the tab index of the host element
   *
   * `@Note:` This is necessary in order for us to enable the focus for div elements
   */
  private _setTabIndex(): void {
    this._renderer.setAttribute(this._elementRef.nativeElement, 'tabindex', '0');
    this._renderer.addClass(this._elementRef.nativeElement, 'outline-none');
  }
}
