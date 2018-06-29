import {
  Component,
  OnInit,
  ViewChild,
  ComponentRef,
  EmbeddedViewRef,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  AnimationEvent,
  trigger,
  state,
  transition,
  animate,
  style
} from '@angular/animations';
import { isNullOrEmpty } from '../../../utilities';
import { McsPortalComponent } from '../portal/mcs-portal-component';
import { McsPortalTemplate } from '../portal/mcs-portal-template';
import { McsSnackBarRefDirective } from './mcs-snack-bar-ref.directive';
import { McsSnackBarConfig } from './mcs-snack-bar-config';
import { McsPlacementType } from '../../core.types';
import { Subject } from 'rxjs';

@Component({
  selector: 'mcs-snack-bar-container',
  template: '<ng-template mcsSnackBarRef></ng-template>',
  styleUrls: ['./mcs-snack-bar-container.component.scss'],
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
    '[@snackBarSlide]': 'state',
    '(@snackBarSlide.start)': 'onAnimationStart($event)',
    '(@snackBarSlide.done)': 'onAnimationDone($event)'
  }
})

export class McsSnackBarContainerComponent implements OnInit {
  @ViewChild(McsSnackBarRefDirective)
  public portalHost: McsSnackBarRefDirective;

  /** Emits when an animation state changes. */
  public animationStateChanged = new Subject<AnimationEvent>();

  // Other variables
  public snackBarConfig: McsSnackBarConfig;
  public state: string;

  // Dispose variables
  private _disposeFn: (() => void) | null;

  /**
   * Returns the vertical placement of the snackbar
   */
  public get verticalPlacement(): McsPlacementType {
    return this.snackBarConfig.verticalPlacement;
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
  public attachComponent<T>(portal: McsPortalComponent<T>): ComponentRef<T> {
    if (isNullOrEmpty(portal)) { return; }

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
   * Attaches a template into snackbar container
   * @param portal Type of portal to be attached
   */
  public attachTemplate<T>(portal: McsPortalTemplate<T>): EmbeddedViewRef<T> {
    if (isNullOrEmpty(portal)) { return; }

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
