import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  coerceBoolean,
  animateFactory,
  CommonDefinition
} from '@app/utilities';
import { McsUniqueId } from '@app/core';

@Component({
  selector: 'mcs-quote-widget',
  templateUrl: './quote-widget.component.html',
  styleUrls: ['./quote-widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.expansionVertical,
    animateFactory.rotate180
  ],
  host: {
    'class': 'quote-widget-wrapper box-shadow-medium',
    '[attr.id]': 'id'
  }
})

export class QuoteWidgetComponent {
  @Input()
  public id: string = McsUniqueId.NewId('quote-widget');

  @Output()
  public collapseChange = new EventEmitter<boolean>();

  @Input()
  public get collapse(): boolean { return this._collapse; }
  public set collapse(value: boolean) {
    if (this._collapse !== value) {
      this._collapse = coerceBoolean(value);
      this.collapseChange.emit(this._collapse);
    }
  }
  private _collapse: boolean = true;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  /**
   * Returns the toggle icon key (Chevron up and down)
   */
  public get toggleIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_UP;
  }

  /**
   * Event that emits when checkbox is ticked
   */
  public toggleWidget(): void {
    this.collapse = !this.collapse;
    this._changeDetectorRef.markForCheck();
  }
}
