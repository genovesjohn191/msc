import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  HostBinding,
  Renderer2,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import {
  registerEvent,
  unregisterEvent,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PopoverComponent implements OnInit, OnDestroy {
  @Output()
  public onClickOutsideEvent: EventEmitter<any>;

  @ViewChild('popoverElement')
  public popoverElement: ElementRef;

  @ViewChild('contentElement')
  public contentElement: ElementRef;

  @HostBinding('attr.role')
  public role;

  @Input()
  @HostBinding('style.max-width')
  public maxWidth;

  @Input()
  public priority: 'low' | 'medium' | 'high';

  @Input()
  public padding: 'default' | 'narrow' | 'none';

  @Input()
  public theme: 'dark' | 'light' | 'gray';

  @Input()
  public trigger: 'manual' | 'hover';

  @Input()
  private _placement: string;
  public get placement(): string {
    return this._placement;
  }
  public set placement(value: string) {
    if (this._placement !== value) {
      this._placement = value;
      this._clearArrow();
      this._createArrow();
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Event handler references
   */
  private _clickHandler = this.onClickOutside.bind(this);
  private _touchHandler = this.onClickOutside.bind(this);

  public constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.onClickOutsideEvent = new EventEmitter<any>();
  }

  public ngOnInit() {
    this.role = 'tooltip';
    this._setPriority();
    this._createArrow();
    this._setTheme();
    this._setPadding();
    this._registerEvents();
  }

  public ngOnDestroy() {
    this._unregisterEvents();
  }

  public onClickOutside(event: any): void {
    this.onClickOutsideEvent.emit(event);
  }

  private _setPriority() {
    if (!this.priority) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, `priority-${this.priority}`);
  }

  private _setTheme() {
    if (!this.theme) { return; }
    this._renderer.addClass(this.popoverElement.nativeElement, this.theme);
  }

  private _setPadding() {
    if (!this.padding || this.padding === 'none') { return; }
    switch (this.padding) {
      case 'narrow':
        this._renderer.addClass(this.contentElement.nativeElement, 'narrow-padding');
        break;
      case 'default':
      default:
        this._renderer.addClass(this.contentElement.nativeElement, 'default-padding');
        break;
    }
  }

  private _registerEvents(): void {
    registerEvent(document.body, 'click', this._clickHandler);
    registerEvent(document.body, 'touchstart', this._touchHandler);
  }

  private _unregisterEvents(): void {
    unregisterEvent(document.body, 'click', this._clickHandler);
    unregisterEvent(document.body, 'touchstart', this._touchHandler);
  }

  private _createArrow() {
    switch (this.placement) {
      case 'top':
        this._renderer.addClass(this.popoverElement.nativeElement, 'arrow-down');
        break;
      case 'right':
        this._renderer.addClass(this.popoverElement.nativeElement, 'arrow-left');
        break;
      case 'left':
        this._renderer.addClass(this.popoverElement.nativeElement, 'arrow-right');
        break;
      case 'bottom':
      default:
        this._renderer.addClass(this.popoverElement.nativeElement, 'arrow-top');
        break;
    }
  }

  private _clearArrow(): void {
    if (isNullOrEmpty(this.popoverElement.nativeElement)) { return; }
    this._renderer.removeClass(this.popoverElement.nativeElement, 'arrow-down');
    this._renderer.removeClass(this.popoverElement.nativeElement, 'arrow-left');
    this._renderer.removeClass(this.popoverElement.nativeElement, 'arrow-right');
    this._renderer.removeClass(this.popoverElement.nativeElement, 'arrow-top');
  }
}
