import {
  Component,
  Input,
  Output,
  Renderer2,
  ViewChild,
  ElementRef,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  coerceBoolean,
  coerceNumber,
  animateFactory,
  isNullOrEmpty,
  refreshView
} from '../../utilities';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-collapsible-panel',
  templateUrl: './collapsible-panel.component.html',
  styleUrls: ['./collapsible-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.expansionVertical
  ],
  host: {
    'class': 'collapsible-panel-wrapper',
    '[attr.id]': 'id',
    '[tabindex]': 'tabindex'
  }
})

export class CollapsiblePanelComponent {
  @Output()
  public collapseChange = new EventEmitter<boolean>();

  @Input()
  public id: string = `mcs-collapsible-panel-${nextUniqueId++}`;

  @Input()
  public get tabindex(): number { return this._tabindex; }
  public set tabindex(value: number) { this._tabindex = coerceNumber(value); }
  private _tabindex: number = 0;

  @Input()
  public get header(): string { return this._header; }
  public set header(value: string) { this._header = value; }
  private _header: string;

  @Input()
  public get collapse(): boolean { return this._collapse; }
  public set collapse(value: boolean) {
    if (this._collapse !== value) {
      this._collapse = coerceBoolean(value);
      this.collapseChange.emit(this._collapse);
    }
  }
  private _collapse: boolean = true;

  @ViewChild('panelElement')
  private _panelElement: ElementRef;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2
  ) { }

  /**
   * Event that emits when checkbox is ticked
   */
  public onCheckboxTick(checkboxRef: any): void {
    if (isNullOrEmpty(checkboxRef)) { return; }
    this.collapse = !checkboxRef.checked;
  }

  /**
   * Removes the overflow of the animation
   *
   * `@Note` This is needed in order to show the whole panel of the select component.
   */
  public removeOverflow(): void {
    if (isNullOrEmpty(this._panelElement)) { return; }
    refreshView(() => {
      this._renderer.removeStyle(this._panelElement.nativeElement, 'overflow');
      this._changeDetectorRef.markForCheck();
    });
  }
}
