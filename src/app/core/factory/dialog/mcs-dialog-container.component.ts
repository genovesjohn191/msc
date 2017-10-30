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
import { McsPortalComponent } from '../portal/mcs-portal-component';
import { McsPortalTemplate } from '../portal/mcs-portal-template';
import { isNullOrEmpty } from '../../../utilities';
import { McsDialogRefDirective } from './mcs-dialog-ref.directive';
import { McsDialogConfig } from './mcs-dialog-config';

@Component({
  selector: 'mcs-dialog-container',
  template: `
    <ng-template mcsDialogRef></ng-template>
  `,
  styleUrls: ['./mcs-dialog-container.component.scss'],
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

export class McsDialogContainerComponent {

  @ViewChild(McsDialogRefDirective)
  public portalHost: McsDialogRefDirective;

  /** Emits when an animation state changes. */
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  // Other variables
  public dialogConfig: McsDialogConfig;
  public state: 'void' | 'enter' | 'exit' = 'enter';
  public isAnimating = false;
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
  public attachComponent<T>(portal: McsPortalComponent<T>): ComponentRef<T> {
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
  public attachTemplate<T>(portal: McsPortalTemplate<T>): EmbeddedViewRef<T> {
    if (isNullOrEmpty(portal)) { return; }

    let templateRef = this.portalHost.viewContainerRef
      .createEmbeddedView(portal.templateRef);

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
   * Save the previously focused element
   */
  private _savePreviouslyFocusedElement() {
    this._previousElementFocus = document.activeElement as HTMLElement;
  }
}
