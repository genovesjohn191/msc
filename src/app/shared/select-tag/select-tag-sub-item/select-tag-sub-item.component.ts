import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  TemplateRef,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'mcs-select-tag-sub-item',
  templateUrl: './select-tag-sub-item.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'select-tag-sub-item-wrapper'
  }
})

export class SelectTagSubItemComponent {

  public visible: boolean;

  @Output()
  public selectionChanged = new EventEmitter<SelectTagSubItemComponent>();

  @ViewChild(TemplateRef)
  public templateRef: TemplateRef<any>;

  @Input()
  public get searchKey(): string { return this._searchKey; }
  public set searchKey(value: string) { this._searchKey = value; }
  private _searchKey: string;

  /**
   * Returns true when the item is selected
   */
  @Input()
  public get value(): any {
    return this._value || this.text;
  }
  public set value(value: any) {
    if (this._value !== value) {
      this._value = value;
    }
  }
  private _value: any;

  /**
   * Returns true when the item is selected
   */
  @Input()
  public get selected(): boolean {
    return this._selected;
  }
  public set selected(value: boolean) {
    if (this._selected !== value) {
      this._selected = value;
      this.selectionChanged.emit(this);
    }
  }
  private _selected: boolean;

  /**
   * Returns the text content of the element
   */
  public get text(): string {
    return this._elementRef.nativeElement.textContent || this._searchKey;
  }

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef
  ) {
    this.visible = true;
  }

  /**
   * Notify angular to refresh the view of this component
   */
  public markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Display this sub item
   */
  public show(): void {
    this.visible = true;
  }

  /**
   * Hide this sub item
   */
  public hide(): void {
    this.visible = false;
  }
}
