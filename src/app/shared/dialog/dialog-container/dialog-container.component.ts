import {
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  EventEmitter,
  ComponentRef,
  EmbeddedViewRef,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import {
  animate,
  AnimationEvent,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { isNullOrEmpty } from '@app/utilities';
import {
  PortalComponent,
  PortalTemplate
} from '../../portal-template';
import { DialogRefDirective } from '../dialog-ref/dialog-ref.directive';
import { DialogConfig } from '../dialog-config';

@Component({
  selector: 'dialog-container',
  template: `
    <ng-template dialogRef></ng-template>
  `,
  styleUrls: ['./dialog-container.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideDialog', [
      state('enter', style({ transform: 'none', opacity: 1 })),
      state('void', style({ transform: 'translate3d(0, 25%, 0) scale(0.9)', opacity: 0 })),
      state('exit', style({ transform: 'translate3d(0, 25%, 0)', opacity: 0 })),
      transition('* => *', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
    ])
  ],
  host: {
    'class': 'dialog-container-wrapper',
    '[@slideDialog]': 'state',
    '(@slideDialog.start)': 'onAnimationStart($event)',
    '(@slideDialog.done)': 'onAnimationDone($event)',
  }
})

export class DialogContainerComponent {

  @ViewChild(DialogRefDirective)
  public portalHost: DialogRefDirective;

  /** Emits when an animation state changes. */
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  // Other variables
  public dialogConfig: DialogConfig;
  public state: 'void' | 'enter' | 'exit' = 'enter';
  public isAnimating = false;

  // Dispose variables
  private _disposeFn: (() => void) | null;
  private _previousElementFocus: HTMLElement | null = null;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) { }

  /**
   * Attaches a component into dialog container
   * @param portal Type of portal to be attached
   */
  public attachComponent<T>(portal: PortalComponent<T>): ComponentRef<T> {
    if (isNullOrEmpty(portal)) { return; }
    this._savePreviouslyFocusedElement();

    // Createt the component dynamically
    let attachView = portal.viewContainerRef ?
      portal.viewContainerRef : this.portalHost.viewContainerRef;
    let componentFactory =
      this._componentFactoryResolver.resolveComponentFactory(portal.component);
    let componenRef = attachView.createComponent(
      componentFactory,
      attachView.length,
      portal.injector || attachView.parentInjector
    );

    // Set the dispose function to destroy the component itself
    this._disposeFn = (() => componenRef.destroy());
    return componenRef;
  }

  /**
   * Attaches a template into dialog container
   * @param portal Type of portal to be attached
   */
  public attachTemplate<T>(portal: PortalTemplate<T>): EmbeddedViewRef<T> {
    if (isNullOrEmpty(portal)) { return; }
    this._savePreviouslyFocusedElement();

    let templateRef = this.portalHost.viewContainerRef
      .createEmbeddedView(portal.templateRef, portal.context);

    // Set the dispose function to destroy the template itself
    this._disposeFn = (() => this.portalHost.viewContainerRef.clear());
    return templateRef;
  }

  /**
   * Event that emits when the animation started
   * @param event Animation event
   */
  public onAnimationStart(event: AnimationEvent) {
    this.isAnimating = true;
    this.animationStateChanged.emit(event);
  }

  /**
   * Event that emits when the animation ended
   * @param event Animation event
   */
  public onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'exit') {
      this._restoreFocus();
    }

    this.animationStateChanged.emit(event);
    this.isAnimating = false;
  }

  /**
   * Start the exit of animation
   */
  public startExitAnimation(): void {
    this.state = 'exit';
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Update the size of the dialog container based on the given length
   * @param width Width of the container
   * @param height Height of the container
   */
  public updateSize(width: string = 'auto', height: string = 'auto'): void {
    this._renderer.setStyle(this._elementRef.nativeElement, 'width', width);
    this._renderer.setStyle(this._elementRef.nativeElement, 'height', height);
  }

  /**
   * Dispose the current dialog attached
   */
  public dispose(): void {
    if (isNullOrEmpty(this._disposeFn)) { return; }
    this._disposeFn();
  }

  /**
   * Save the previously focused element
   */
  private _savePreviouslyFocusedElement(): void {
    if (isNullOrEmpty(document)) { return; }
    this._previousElementFocus = document.activeElement as HTMLElement;

    // Move the focus to the dialog immediately in order to prevent the user
    // from accidentally opening multiple dialogs at the same time.
    Promise.resolve().then(() => this._elementRef.nativeElement.focus());
  }

  private _restoreFocus(): void {
    let toFocus = this._previousElementFocus;
    if (toFocus && typeof toFocus.focus === 'function') {
      toFocus.focus();
    }
  }
}
