import {
  Directive,
  Input,
  OnChanges,
  TemplateRef,
  IterableDiffer,
  IterableDiffers,
  IterableChanges,
  SimpleChanges
} from '@angular/core';
import { coerceArray } from '@app/utilities';

@Directive({
  selector: '[mcsDataRowDef]'
})

export class DataRowDefDirective implements OnChanges {
  @Input('mcsDataRowDefColumns')
  public get columns(): string[] { return this._columns; }
  public set columns(value: string[]) { this._columns = coerceArray(value); }
  private _columns: string[];

  private _columnsDiffer: IterableDiffer<any>;

  constructor(
    public template: TemplateRef<any>,
    public differs: IterableDiffers
  ) { }

  public ngOnChanges(changes: SimpleChanges) {
    if (!this._columnsDiffer) {
      const columns = (changes['columns'] && changes['columns'].currentValue) || [];
      this._columnsDiffer = this.differs.find(columns).create();
      this._columnsDiffer.diff(columns);
    }
  }

  public getColumnsDiff(): IterableChanges<any> | null {
    return this._columnsDiffer.diff(this.columns);
  }
}
