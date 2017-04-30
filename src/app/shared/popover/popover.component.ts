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
  public theme: 'dark' | 'light';

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

  public constructor(private _renderer: Renderer2) {
    this.role = 'tooltip';
    this.onClickOutsideEvent = new EventEmitter<any>();
  }

  public ngOnInit() {
    this.setArrowDirection();
    this.setTheme();
  }

  @HostListener('document:click', ['$event'])
  public onClickOutside(event: any): void {
    if (this.trigger !== 'manual') { return; }
    this.onClickOutsideEvent.emit(event);
  }

  public setArrowDirection() {
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

  public setTheme() {
    if (!this.theme) { return; }
    this._renderer.addClass(this.popoverElement.nativeElement, this.theme);
  }
}
