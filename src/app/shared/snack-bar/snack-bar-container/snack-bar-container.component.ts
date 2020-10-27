import { Subject } from 'rxjs';

import {
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationEvent
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  isNullOrEmpty,
  McsPlacementType,
  McsThemeType
} from '@app/utilities';

import {
  PortalComponent,
  PortalTemplate
} from '../../portal-template';
import { SnackBarConfig } from '../snack-bar-config';
import { SnackBarRefDirective } from '../snack-bar-ref/snack-bar-ref.directive';

@Component({
  selector: 'snack-bar-container',
  template: `
    <ng-template snackBarRef></ng-template>
    <div *ngIf="message">
      <span>{{ message }}</span>
    </div>
  `,
  styleUrls: ['./snack-bar-container.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('snackBarSlide', [
      state('top, bottom', style({ transform: 'translateY(0%)' })),
      transition('* => void',
        animate(`195ms cubic-bezier(0.4,0.0,1,1)`)
      ),
      transition('void => *',
        animate(`225ms cubic-bezier(0.4,0.0,0.2,1)`)
      )
    ])
  ],
  host: {
    'class': 'snack-bar-container-wrapper box-shadow-medium',
    '[class.top-position]': 'verticalPlacement === "top"',
    '[class.bottom-position]': 'verticalPlacement === "bottom"',
    '[class.snack-bar-light]': 'snackBarTheme === "light"',
    '[class.snack-bar-dark]': 'snackBarTheme === "dark"',
    '[@snackBarSlide]': 'state',
    '(@snackBarSlide.start)': 'onAnimationStart($event)',
    '(@snackBarSlide.done)': 'onAnimationDone($event)'
  }
})

export class SnackBarContainerComponent implements OnInit {
  @ViewChild(SnackBarRefDirective, { static: true })
  public portalHost: SnackBarRefDirective;

  /** Emits when an animation state changes. */
  public animationStateChanged = new Subject<AnimationEvent>();

  // Other variables
  public snackBarConfig: SnackBarConfig;
  public state: string;
  public message: string;

  // Dispose variables
  private _disposeFn: (() => void) | null;

  /**
   * Returns the vertical placement of the snackbar
   */
  public get verticalPlacement(): McsPlacementType {
    return this.snackBarConfig.verticalPlacement;
  }

  /**
   * Returns the snackbar theme
   */
  public get snackBarTheme(): McsThemeType {
    return this.snackBarConfig.theme;
  }

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    // Set the initial state animation of the component based on placement
    this.state = this.snackBarConfig.verticalPlacement;
  }

  /**
   * Attaches a component into snackbar container
   * @param portal Type of portal to be attached
   */
  public attachComponent<T>(portal: PortalComponent<T>): ComponentRef<T> {
    if (isNullOrEmpty(portal)) { return; }

    // Createt the component dynamically
    let attachView = portal.viewContainerRef ?
      portal.viewContainerRef : this.portalHost.viewContainerRef;
    let componentFactory =
      this._componentFactoryResolver.resolveComponentFactory(portal.component);
    let componenRef = attachView.createComponent(
      componentFactory,
      attachView.length,
      portal.injector
    );

    // Set the dispose function to destroy the component itself
    this._disposeFn = (() => componenRef.destroy());
    return componenRef;
  }

  /**
   * Attaches a template into snackbar container
   * @param portal Type of portal to be attached
   */
  public attachTemplate<T>(portal: PortalTemplate<T>): EmbeddedViewRef<T> {
    if (isNullOrEmpty(portal)) { return; }

    let templateRef = this.portalHost.viewContainerRef
      .createEmbeddedView(portal.templateRef, portal.context);

    // Set the dispose function to destroy the template itself
    this._disposeFn = (() => this.portalHost.viewContainerRef.clear());
    return templateRef;
  }

  /**
   * Attached the message to snackbar
   */
  public attachMessage(_message: string): string {
    if (isNullOrEmpty(_message)) { return; }
    this.message = _message;

    // Set the dispose function to destroy the message instance itself
    this._disposeFn = (() => this.message = undefined);
    return _message;
  }

  /**
   * Event that emits when the animation started
   * @param event Animation event
   */
  public onAnimationStart(event: AnimationEvent) {
    this.animationStateChanged.next(event);
  }

  /**
   * Event that emits when the animation ended
   * @param event Animation event
   */
  public onAnimationDone(event: AnimationEvent) {
    this.animationStateChanged.next(event);
  }

  /**
   * Start the exit of animation
   */
  public startExitAnimation(): void {
    this.state = 'void';
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Dispose the current snackbar attached
   */
  public dispose(): void {
    if (isNullOrEmpty(this._disposeFn)) { return; }
    this._disposeFn();
  }
}
