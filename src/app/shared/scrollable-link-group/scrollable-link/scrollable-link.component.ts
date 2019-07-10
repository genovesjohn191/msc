import {
  Component,
  Input,
  TemplateRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  McsUniqueId,
  McsScrollDispatcherService
} from '@app/core';
import { coerceBoolean } from '@app/utilities';

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
  public labelIsHidden: boolean;

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

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
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
      this._scrollDispatcherService.scrollToElement(this.hostElement, DEFAULT_CONTENT_OFFSET_FROM_TOP);
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Hides the label of the scrollable link element
   */
  public hideLabel(): void {
    this.labelIsHidden = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Shows the label of the scrollable link element
   */
  public showLabel(): void {
    this.labelIsHidden = false;
    this._changeDetectorRef.markForCheck();
  }
}
