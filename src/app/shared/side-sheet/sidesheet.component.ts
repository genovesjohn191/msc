import { Subject } from 'rxjs';

import {
  state,
  AnimationEvent
} from '@angular/animations';
import {
  ComponentPortal,
  TemplatePortal
} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  HostBinding,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { IMcsNavigateAwayGuard } from '@app/core';
import {
  animateFactory,
  convertRawObjectToString,
  isNullOrEmpty,
  McsDisposable
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { SideSheetConfig } from './models/sidesheet.config';
import { SideSheetDirective } from './sidesheet.directive';

@Component({
  selector: 'mcs-sidesheet',
  templateUrl: './sidesheet.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.slideRight,
    animateFactory.slideLeft
  ]
})
export class SideSheetComponent implements McsDisposable, OnInit, OnDestroy {
  public config: SideSheetConfig;
  public opened = new Subject<void>();
  public closed = new Subject<void>();
  public state: 'void' | 'enter' = 'enter';

  private _disposeFn: (() => void) | null;
  private _previousElementFocus: HTMLElement | null = null;
  private _portalComponentRef: ComponentRef<any>;

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _translate: TranslateService
  ) {
  }

  @ViewChild(SideSheetDirective, { static: true })
  public sidesheetView: SideSheetDirective;

  @HostBinding('class')
  public get hostClass(): string | null {
    return convertRawObjectToString({
      'mcs-sidesheet': true,
      'mcs-sidesheet-size': this.config?.size || 'xs'
    });
  }

  @HostBinding('@slideRight')
  public get slideIn(): string {
    return this.state;
  }

  @HostListener('@slideRight.start', ['$event'])
  public slideInStart(event: AnimationEvent): void {
    this.opened.next();
  }

  @HostListener('@slideRight.done', ['$event'])
  public slideInDone(event: AnimationEvent): void {
    if (event.phaseName === 'done' && event.toState === 'void') {
      this._restorePreviouslyFocusedElement();
      this.closed.next();
    }
  }

  public ngOnInit(): void {
    // TODO(apascual): Mimic the animation stream here
  }

  public ngOnDestroy(): void {
  }

  public attachComponent<TComponent>(portal: ComponentPortal<TComponent>): ComponentRef<TComponent> {
    if (isNullOrEmpty(portal)) { return; }
    this._savePreviouslyFocusedElement();

    // Create the component dynamically
    let attachView = portal.viewContainerRef || this.sidesheetView.viewContainerRef;
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(portal.component);
    let componentRef = attachView.createComponent(
      componentFactory,
      attachView.length,
      portal.injector
    );

    this._portalComponentRef = componentRef;
    this._disposeFn = (() => componentRef.destroy());
    return componentRef;
  }

  public attachTemplate<TTemplate>(portal: TemplatePortal<TTemplate>): EmbeddedViewRef<TTemplate> {
    if (isNullOrEmpty(portal)) { return; }
    this._savePreviouslyFocusedElement();

    let templateRef = this.sidesheetView.viewContainerRef
      .createEmbeddedView(portal.templateRef, portal.context);

    this._disposeFn = (() => this.sidesheetView.viewContainerRef.clear());
    return templateRef;
  }

  public close(): boolean {
    if (!this.canCloseAssociatedComponent()) return false;

    this.state = 'void';
    return true;
  }

  public dispose(): void {
    if (isNullOrEmpty(this._disposeFn)) { return; }
    this._disposeFn();
  }

  public canCloseAssociatedComponent(): boolean {
    if (!this._portalComponentRef) return true;

    // Validate and execute if safe closing func was defined
    let isNavigateAwayDefined = (this._portalComponentRef?.instance as IMcsNavigateAwayGuard)?.canNavigateAway;
    if (!isNavigateAwayDefined) return true;

    if (isNavigateAwayDefined && (this._portalComponentRef?.instance as IMcsNavigateAwayGuard).canNavigateAway())
      return true;

    let message = this._translate.instant('message.navigateAwaySheet');
    return window.confirm(message);
  }

  private _savePreviouslyFocusedElement(): void {
    if (isNullOrEmpty(document)) { return; }
    this._previousElementFocus = document.activeElement as HTMLElement;

    // Move the focus to the dialog immediately in order to prevent the user
    // from accidentally opening multiple dialogs at the same time.
    Promise.resolve().then(() => this._elementRef.nativeElement.focus());
  }

  private _restorePreviouslyFocusedElement(): void {
    let toFocus = this._previousElementFocus;
    if (toFocus && typeof toFocus.focus === 'function') {
      toFocus.focus();
    }
  }
}
