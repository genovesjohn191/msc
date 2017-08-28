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

@Directive({
  selector: '[mcsDataRowDef]'
})

export class DataRowDefDirective implements OnChanges {

  public columnsDiffer: IterableDiffer<any>;

  @Input('mcsDataRowDefColumns')
  public get columns(): string[] {
    return this._columns;
  }
  public set columns(value: string[]) {
    this._columns = value;
  }
  private _columns: string[];

  constructor(
    public template: TemplateRef<any>,
    public differs: IterableDiffers
  ) { }

  public ngOnChanges(changes: SimpleChanges) {
    const columns = changes['columns'].currentValue;
    if (!this.columnsDiffer && columns) {
      this.columnsDiffer = this.differs.find(columns).create();
      this.columnsDiffer.diff(columns);
    }
  }

  public getColumnsDiff(): IterableChanges<any> | null {
    return this.columnsDiffer.diff(this.columns);
  }
}
