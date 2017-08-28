import {
  Directive,
  Input,
  ContentChild
} from '@angular/core';
/** Directives */
import { HeaderCellDefDirective } from '../header';
import { DataCellDefDirective } from '../data';

@Directive({
  selector: '[mcsColumnDef]'
})

export class ColumnDefDirective {

  @ContentChild(HeaderCellDefDirective)
  public headerCellDef: any;

  @ContentChild(DataCellDefDirective)
  public dataCellDef: DataCellDefDirective;

  @Input('mcsColumnDef')
  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }
  private _name: string;

  @Input('mcsColumnDefClass')
  public get class(): string {
    return this._class;
  }
  public set class(value: string) {
    this._class = value;
  }
  private _class: string;
}
