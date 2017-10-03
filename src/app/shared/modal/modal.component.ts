import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  Renderer2,
  ElementRef,
  EventEmitter,
  ViewChild,
  HostBinding,
  HostListener,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {
  trigger,
  style,
  transition,
  animate
} from '@angular/animations';
import { refreshView } from '../../utilities';

// Modal attribute definition
const ATTRIBUTE_MODAL_ICON = 'modal-icon';
const ATTRIBUTE_MODAL_TITLE = 'modal-title';
const ATTRIBUTE_MODAL_SUBTITLE = 'modal-subtitle';
const ATTRIBUTE_MODAL_BODY = 'modal-body';

@Component({
  selector: 'mcs-modal',
  templateUrl: './modal.component.html',
  styles: [require('./modal.component.scss')],
  animations: [
    trigger('dialog', [
      transition('void => *', [
        style({ opacity: 1, transform: 'translateY(-5%)' }),
        animate('400ms ease-in-out')
      ]),
      transition('* => void', [
        animate('300ms ease-in-out',
          style({ opacity: 0, transform: 'translateY(0)' })
        )
      ])
    ])
  ]
})

export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
  public visible: boolean;

  @Input()
  public content: TemplateRef<any> | string;

  @Input()
  public iconKey: string;

  @Input()
  public size: 'small' | 'medium' | 'large';

  @Output()
  public onClickOutsideEvent: EventEmitter<any>;

  @Output()
  public onCloseModalEvent: EventEmitter<any>;

  @ViewChild('modalElement')
  public modalElement: ElementRef;

  @ViewChild('modalIconElement')
  public modalIconElement: ElementRef;

  @ViewChild('modalTitleElement')
  public modalTitleElement: ElementRef;

  @ViewChild('modalSubtitleElement')
  public modalSubtitleElement: ElementRef;

  @ViewChild('modalBodyElement')
  public modalBodyElement: ElementRef;

  @ViewChild('modalBackdropElement')
  public modalBackdropElement: any;

  @HostBinding('class')
  public classes: string;

  @HostBinding('attr.role')
  public role;

  @HostBinding('attr.tabindex')
  public tabIndex;

  public constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _viewContainerRef: ViewContainerRef
  ) {
    this.size = 'large';
    this.visible = true;
    this.onClickOutsideEvent = new EventEmitter<any>();
    this.onCloseModalEvent = new EventEmitter<any>();
  }

  public ngOnInit() {
    this._setHostBinding();
    this._renderer.addClass(document.body, 'modal-open');
  }

  public ngAfterViewInit() {
    if (!this._elementRef.nativeElement.contains(document.activeElement)) {
      this.setModalSize();
      this._elementRef.nativeElement.focus();
    }

    refreshView(() => {
      this.setModalContents(this._getElementNodes());
    });
  }

  public ngOnDestroy() {
    this._renderer.removeClass(document.body, 'modal-open');
  }

  @HostListener('document:click', ['$event'])
  public onClickOutside(event: any): void {
    this.onClickOutsideEvent.emit(event);
  }

  @HostListener('keyup.esc', ['$event'])
  public onEscKeyUp(event: any): void {
    this.onCloseModalEvent.emit(event);
  }

  public onClickCloseButton(event: any) {
    this.onCloseModalEvent.emit(event);
  }

  public setModalSize(): void {
    if (!this.size || !this.modalElement) { return; }

    switch (this.size) {
      case 'small':
        this._renderer.addClass(this.modalElement.nativeElement, 'modal-sm');
        break;

      case 'medium':
        this._renderer.addClass(this.modalElement.nativeElement, 'modal-md');
        break;

      case 'large':
      default:
        this._renderer.addClass(this.modalElement.nativeElement, 'modal-lg');
        break;
    }
  }

  public setModalContents(elements: HTMLElement[]): void {
    // Exit method in case the element nodes is undefined
    if (!elements) { return; }

    // Filter all the elements by modal settings and append
    // their corresponding element
    elements.forEach((element) => {
      if (element && element.nodeName === 'DIV') {
        if (element.hasAttribute(ATTRIBUTE_MODAL_ICON)) {
          this._renderer.appendChild(this.modalIconElement.nativeElement, element);

        } else if (element.hasAttribute(ATTRIBUTE_MODAL_TITLE)) {
          this._renderer.appendChild(this.modalTitleElement.nativeElement, element);

        } else if (element.hasAttribute(ATTRIBUTE_MODAL_SUBTITLE)) {
          this._renderer.appendChild(this.modalSubtitleElement.nativeElement, element);

        } else if (element.hasAttribute(ATTRIBUTE_MODAL_BODY)) {
          this._renderer.appendChild(this.modalBodyElement.nativeElement, element);

        }
      }
    });
  }

  private _getElementNodes(): HTMLElement[] {
    if (!this.content) { return undefined; }
    let elementNodes: HTMLElement[];

    elementNodes = this._viewContainerRef
      .createEmbeddedView(this.content as TemplateRef<any>).rootNodes;
    return elementNodes;
  }

  private _setHostBinding(): void {
    this.classes = 'modal fade show';
    this.role = 'dialog';
    this.tabIndex = '-1';
  }
}
