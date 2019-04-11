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
  animateFactory
} from '@app/utilities';
import {
  CoreDefinition,
  McsUniqueId
} from '@app/core';
import { DataStatus, McsOrder } from '@app/models';
import { PricingCalculator } from './pricing-calculator';

@Component({
  selector: 'mcs-pricing-calculator',
  templateUrl: './pricing-calculator.component.html',
  styleUrls: ['./pricing-calculator.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.expansionVertical,
    animateFactory.rotate180
  ],
  host: {
    'class': 'pricing-calculator-wrapper box-shadow-medium',
    '[attr.id]': 'id',
    '[class.hide-element]': 'hidden'
  }
})

export class PricingCalculatorComponent implements PricingCalculator {
  public hidden: boolean = true;

  @Input()
  public id: string = McsUniqueId.NewId('pricing-calculator');

  @Input()
  public state: DataStatus;

  @Input()
  public order: McsOrder;

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
   * Shows the pricing calculator widget
   */
  public showWidget(): void {
    this.hidden = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Hides the pricing calculator widget
   */
  public hideWidget(): void {
    this.hidden = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Returns true when the qidget is in progress
   */
  public get isInProgress(): boolean {
    return this.state === DataStatus.InProgress;
  }

  /**
   * Returns the toggle icon key (Chevron up and down)
   */
  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_UP;
  }

  /**
   * Event that emits when checkbox is ticked
   */
  public toggleWidget(): void {
    this.collapse = !this.collapse;
    this._changeDetectorRef.markForCheck();
  }
}