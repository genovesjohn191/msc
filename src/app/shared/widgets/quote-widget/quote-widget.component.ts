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
} from '../../../utilities';
import { CoreDefinition } from '../../../core';

// Unique Id that generates during runtime
let nextUniqueId = 0;

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
    'class': 'quote-widget-wrapper',
    '[attr.id]': 'id'
  }
})

export class QuoteWidgetComponent {
  @Input()
  public id: string = `mcs-quote-widget-${nextUniqueId++}`;

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
   * Returns the toggle icon key (Chevron right and down)
   */
  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  /**
   * Event that emits when checkbox is ticked
   */
  public toggleWidget(): void {
    this.collapse = !this.collapse;
    this._changeDetectorRef.markForCheck();
  }
}
