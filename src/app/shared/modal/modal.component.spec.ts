import {
  async,
  TestBed
} from '@angular/core/testing';
import { TemplateRef } from '@angular/core';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {

  /** Stub Services/Components */
  let component: ModalComponent;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ModalComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ModalComponent, {
      set: {
        template: `
          <div #modalElement>Modal Element</div>
          <div #modalIconElement>Icon Element</div>
          <div #modalTitleElement>Title Element</div>
          <div #modalSubtitleElement>Subtitle Element</div>
          <div #modalBodyElement>Body Element</div>
          <div #modalBackdropElement>Modal Backdrop Element</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ModalComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should set the host class to modal`, () => {
      let modalClassExist = component.classes.includes('modal');
      expect(modalClassExist).toBeTruthy();
    });

    it(`should set the host class to fade`, () => {
      let fadeClassExist = component.classes.includes('fade');
      expect(fadeClassExist).toBeTruthy();
    });

    it(`should set the host class to show`, () => {
      let showClassExist = component.classes.includes('show');
      expect(showClassExist).toBeTruthy();
    });

    it(`should set the host role attribute to dialog`, () => {
      let roleExist = component.role.includes('dialog');
      expect(roleExist).toBeTruthy();
    });

    it(`should set the host tabindex attribute to -1`, () => {
      let tabindexExist = component.tabIndex.includes('-1');
      expect(tabindexExist).toBeTruthy();
    });

    it(`should set the modal-open class to document body element`, () => {
      let modalOpenExist = document.body.classList.contains('modal-open');
      expect(modalOpenExist).toBeTruthy();
    });
  });

  describe('setModalContents()', () => {
    beforeEach(async(() => {
      let elements: HTMLElement[] = new Array();
      let modalIcon: HTMLElement = document.createElement('div');
      modalIcon.setAttribute('modal-icon', '');
      modalIcon.innerHTML = 'icon';

      let modalTitle: HTMLElement = document.createElement('div');
      modalTitle.setAttribute('modal-title', '');
      modalTitle.innerHTML = 'title';

      let modalSubtitle: HTMLElement = document.createElement('div');
      modalSubtitle.setAttribute('modal-subtitle', '');
      modalSubtitle.innerHTML = 'subtitle';

      let modalBody: HTMLElement = document.createElement('div');
      modalBody.setAttribute('modal-body', '');
      modalBody.innerHTML = 'body';

      elements.push(modalIcon);
      elements.push(modalTitle);
      elements.push(modalSubtitle);
      elements.push(modalBody);

      component.setModalContents(elements);
    }));

    it(`should set the modal icon in the component`, () => {
      let modalIcon: string;
      modalIcon = component.modalIconElement.nativeElement.innerHTML;
      expect(modalIcon).toContain('icon');
    });

    it(`should set the modal title in the component`, () => {
      let modalTitle: string;
      modalTitle = component.modalTitleElement.nativeElement.innerHTML;
      expect(modalTitle).toContain('title');
    });

    it(`should set the modal subtitle in the component`, () => {
      let modalSubtitle: string;
      modalSubtitle = component.modalSubtitleElement.nativeElement.innerHTML;
      expect(modalSubtitle).toContain('subtitle');
    });

    it(`should set the modal body in the component`, () => {
      let modalBody: string;
      modalBody = component.modalBodyElement.nativeElement.innerHTML;
      expect(modalBody).toContain('body');
    });
  });

  describe('setModalSize() when size is small', () => {
    beforeEach(async(() => {
      component.size = 'small';
      component.setModalSize();
    }));

    it(`should set the modal size to small`, () => {
      let modalSizeExist: boolean;
      modalSizeExist = component.modalElement.nativeElement
        .classList.contains('modal-sm');
      expect(modalSizeExist).toBeTruthy();
    });
  });

  describe('setModalSize() when size is large', () => {
    beforeEach(async(() => {
      component.size = 'large';
      component.setModalSize();
    }));

    it(`should set the modal size to large`, () => {
      let modalSizeExist: boolean;
      modalSizeExist = component.modalElement.nativeElement
        .classList.contains('modal-lg');
      expect(modalSizeExist).toBeTruthy();
    });
  });

  describe('onClickOutside()', () => {
    it(`should emit the onClickOutsideEvent property`, () => {
      spyOn(component.onClickOutsideEvent, 'emit');
      let event = document.createEvent('Event');
      event.initEvent('click', false, true);
      document.dispatchEvent(event);
      expect(component.onClickOutsideEvent.emit).toHaveBeenCalled();
    });
  });

  describe('onEscKeyUp()', () => {
    it(`should emit the onCloseModalEvent property`, () => {
      spyOn(component.onCloseModalEvent, 'emit');
      let event = document.createEvent('Event');
      event.initEvent('keyup.esc', false, true);
      component.onEscKeyUp(event);
      expect(component.onCloseModalEvent.emit).toHaveBeenCalled();
    });
  });

  describe('onClickCloseButton()', () => {
    it(`should emit the onClickCloseButton property`, () => {
      spyOn(component.onCloseModalEvent, 'emit');
      let event = document.createEvent('Event');
      event.initEvent('click', false, true);
      component.onClickCloseButton(event);
      expect(component.onCloseModalEvent.emit).toHaveBeenCalled();
    });
  });
});
