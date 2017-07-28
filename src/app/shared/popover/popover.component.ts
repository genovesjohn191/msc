import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  HostBinding,
  Renderer2,
  HostListener,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'mcs-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popover.component.html',
  styles: [require('./popover.component.scss')]
})

export class PopoverComponent implements OnInit {
  @Input()
  public title: any;

  @Input()
  public placement: string;

  @Input()
  public padding: 'default' | 'narrow' | 'none';

  @Input()
  public theme: 'dark' | 'light' | 'gray';

  @Input()
  public trigger: 'manual' | 'hover';

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

  public constructor(private _renderer: Renderer2) {
    this.onClickOutsideEvent = new EventEmitter<any>();
  }

  public ngOnInit() {
    this.role = 'tooltip';
    this._setArrowDirection();
    this._setTheme();
    this._setPadding();
  }

  // TODO: For testing in actual mobile devices
  @HostListener('document:touchstart', ['$event'])
  @HostListener('document:click', ['$event'])
  public onClickOutside(event: any): void {
    this.onClickOutsideEvent.emit(event);
  }

  public _setArrowDirection() {
    switch (this.placement) {
      case 'top':
        this._renderer.setStyle(this.popoverElement.nativeElement,
          'flex-direction', 'column-reverse');
        this._renderer.addClass(this.popoverElement.nativeElement, 'arrow-down');
        break;
      case 'right':
        this._renderer.setStyle(this.popoverElement.nativeElement, 'flex-direction', 'row');
        this._renderer.addClass(this.popoverElement.nativeElement, 'arrow-left');
        break;
      case 'left':
        this._renderer.setStyle(this.popoverElement.nativeElement,
          'flex-direction', 'row-reverse');
        this._renderer.addClass(this.popoverElement.nativeElement, 'arrow-right');
        break;
      case 'bottom':
      default:
        this._renderer.setStyle(this.popoverElement.nativeElement, 'flex-direction', 'column');
        this._renderer.addClass(this.popoverElement.nativeElement, 'arrow-top');
        break;
    }
  }

  public _setTheme() {
    if (!this.theme) { return; }
    this._renderer.addClass(this.popoverElement.nativeElement, this.theme);
  }

  public _setPadding() {
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
}
