import {
  Directive,
  ElementRef,
  Injector,
  ComponentFactoryResolver,
  ViewContainerRef,
  NgZone,
  OnInit,
  OnDestroy,
  Input,
  TemplateRef,
  ComponentRef,
  Renderer2,
  HostListener
} from '@angular/core';
import { ModalComponent } from './modal.component';
import { McsComponentService } from '../../core';
import { refreshView } from '../../utilities';

@Directive({
  selector: '[mcsModal]',
  exportAs: 'mcsModal'
})

export class ModalDirective implements OnInit, OnDestroy {
  @Input()
  public mcsModal: TemplateRef<any> | string;

  @Input()
  public modalSize: 'small' | 'large';

  public componentService: McsComponentService<ModalComponent>;
  public componentRef: ComponentRef<ModalComponent>;

  constructor(
    private _elementRef: ElementRef,
    private _injector: Injector,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _renderer: Renderer2,
    private _ngZone: NgZone
  ) {
    this.modalSize = 'large';
  }

  public ngOnInit() {
    // Initilize component service instance to set the view host attributes
    this.componentService = new McsComponentService<ModalComponent>(
      ModalComponent,
      this._componentFactoryResolver,
      this._viewContainerRef,
      this._injector,
      this._renderer
    );
  }

  public ngOnDestroy() {
    this.close();
  }

  public open() {
    if (!this.componentRef) {
      this.componentRef = this.componentService.createComponent();

      this.componentRef.instance.size = this.modalSize;
      this.componentRef.instance.content = this.mcsModal;
      this.componentRef.instance.onClickOutsideEvent.subscribe((event) => {
        this.onClickOutside(event);
      });

      this.componentRef.instance.onCloseModalEvent.subscribe((event) => {
        this.onCloseModal(event);
      });

      window.document.querySelector('body')
        .appendChild(this.componentRef.location.nativeElement);
    }
  }

  public close() {
    if (this.componentRef) {
      this.componentRef.instance.visible = false;

      // Add delay to show the animation first before deleting the component
      refreshView(() => {
        this.componentRef.instance.modalBackdropElement.removeComponent();
        this.componentService.deleteComponent();
        this.componentRef.destroy();
        this.componentRef = null;
      }, 300);
    }
  }

  public onClickOutside(event: any): void {
    if (!this.componentRef || !this._elementRef ||
      !this.componentRef.instance.modalElement) { return; }

    if (!this.componentRef.instance.modalElement.nativeElement.contains(event.target) &&
      !this._elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  public onCloseModal(event: any): void {
    if (!this.componentRef) { return; }
    this.close();
  }

  @HostListener('click')
  public onClick(): void {
    this.open();
  }
}
