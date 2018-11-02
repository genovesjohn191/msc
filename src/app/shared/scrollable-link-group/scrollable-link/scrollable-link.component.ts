import {
  Component,
  Input,
  TemplateRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild
} from '@angular/core';
import {
  McsUniqueId,
  McsScrollDispatcherService
} from '@app/core';
import {
  coerceBoolean,
  isNullOrEmpty
} from '@app/utilities';

const DEFAULT_CONTENT_OFFSET_FROM_TOP = 50;

@Component({
  selector: 'mcs-scrollable-link',
  templateUrl: './scrollable-link.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'scrollable-link-wrapper',
    '[class.scrollable-link-active]': 'active',
    '[attr.id]': 'id'
  }
})

export class ScrollableLinkComponent {
  public id = McsUniqueId.NewId('scrollable-link');

  @Input()
  public label: string;

  @Input()
  public labelTemplate: TemplateRef<any>;

  @Input()
  public get active(): boolean { return this._active; }
  public set active(value: boolean) {
    if (this._active !== value) {
      this._active = coerceBoolean(value);
    }
  }
  private _active: boolean;

  @ViewChild('headerElement')
  private _headerElement: ElementRef<any>;

  constructor(
    private _elementRef: ElementRef,
    private _scrollDispatcherService: McsScrollDispatcherService
  ) {
    this.active = false;
  }

  /**
   * Returns the host element of the component
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Scroll element into view
   */
  public scrollIntoView(): void {
    Promise.resolve().then(() => {
      if (isNullOrEmpty(this._headerElement)) { return; }
      let headerElement = this._headerElement.nativeElement as HTMLElement;
      this._scrollDispatcherService.scrollToElement(headerElement, DEFAULT_CONTENT_OFFSET_FROM_TOP);
    });
  }
}
