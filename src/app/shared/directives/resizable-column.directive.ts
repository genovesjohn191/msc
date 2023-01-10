import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  Renderer2
} from "@angular/core";
import { 
  fromEvent, 
  map, 
  switchMap, 
  tap 
} from "rxjs";
import {
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';

@Directive({
  selector: "[mcsResizable]"
})

export class ResizableColumnDirective implements OnInit {
  
  @Input("mcsResizable") resizable: boolean;
  
  private _column: HTMLElement;
  private _pressed: boolean;
  private _offset = 35;
                  
  constructor(
    private renderer: Renderer2,
    private el: ElementRef){
    this._column = this.el.nativeElement;
  }

  ngOnInit() {
    if (this.resizable) {
      const row = this.renderer.parentNode(this._column);
      const thead = this.renderer.parentNode(row);
      const table = this.renderer.parentNode(thead);
      const colIndex = Array.from(row.children).indexOf(this._column);

      this.createResizer();

      fromEvent<MouseEvent>(this._column, 'mousedown')
        .pipe(
          tap((e) => e.preventDefault()),
          switchMap((e) => {
            
            const startX = e.pageX;
            const startWidth = this._column.offsetWidth;
            
            return fromEvent<MouseEvent>(table, 'mousemove').pipe(
              map((e) => {
                if (this._pressed && e.buttons) {
                  this.renderer.addClass(table, "resizing");
                  let resizedWidth = startWidth + e.pageX - startX;
                  if (resizedWidth <= this._column.clientWidth)
                    resizedWidth = this._column.clientWidth - this._offset;
                  else
                    resizedWidth -= this._offset;
                  this.renderer.setStyle(this._column, "width", `${resizedWidth}px`);
                  
                  const tableCells = Array.from(table.querySelectorAll(".mat-row")).map(
                    (row: any) => row.querySelectorAll(".mat-cell").item(colIndex)
                  );
                  tableCells.forEach(cell => this.setWidth(cell, resizedWidth));
                }
                
              }),
              distinctUntilChanged(),
              takeUntil(fromEvent(window.document, 'mouseup')
                .pipe(
                  tap((e) => {
                    if (this._pressed) {
                      this._pressed = false;
                      this.renderer.removeClass(table, "resizing"); 
                    }
                  })))
            );
        })).subscribe(() => {
          this._pressed = true;
        })
    }
  }

  private createResizer() {
    const resizerElem = this.renderer.createElement("span");
    this.renderer.addClass(resizerElem, "resize-holder");
    this.renderer.appendChild(this._column, resizerElem);
  }

  private setWidth(el: any, width: number): void {
    if (el.childElementCount > 0) {
      for(let idx = 0; idx < el.children.length; idx++)
        this.setWidth(el.children.item(idx), width);
    }
    else
      this.renderer.setStyle(el, "width", `${width}px`);
  }
}