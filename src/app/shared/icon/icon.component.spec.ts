import {
  async,
  TestBed,
  getTestBed,
  ComponentFixture
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { CoreTestingModule } from '@app/core/testing';
import { CommonDefinition } from '@app/utilities';
import { IconComponent } from './icon.component';
import { IconService } from './icon.service';

describe('IconComponent', () => {

  /** Stub Services/Components */
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<IconComponent>;
  let component: IconComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        IconComponent
      ],
      imports: [
        CoreTestingModule
      ],
      providers: [
        IconService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(IconComponent, {
      set: {
        template: `
          <div>Image creation based on type</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      httpMock = getTestBed().get(HttpTestingController);
      fixture = TestBed.createComponent(IconComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnChanges() when icon type is SVG', () => {
    beforeEach(async(() => {
      component.key = CommonDefinition.ASSETS_SVG_ADD_BLACK;
      component.size = 'small';
      component.ngOnChanges();
    }));

    it('should create the main component element', () => {
      expect(fixture.nativeElement).toBeDefined();
    });

    it('should create the icon container element', () => {
      let element = document.getElementsByClassName('icon-container');
      expect(element).not.toBe(null);
    });

    it('should create the svg element', () => {
      // Create mock for HTTP client
      let mockRequest = httpMock.expectOne(`assets/icon//add-black.svg`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create element for response
      let svgElement = '<svg><title>Svg Content</title></svg>';
      mockRequest.flush(svgElement);

      // Expect the response
      let element = document.querySelector('svg');
      expect(element).not.toBe(null);
    });
  });

  describe('ngOnChanges() when icon type is Image(jpeg, png, gif)', () => {
    beforeEach(async(() => {
      component.key = CommonDefinition.ASSETS_GIF_LOADER_SPINNER;
      component.size = 'small';
      component.ngOnChanges();
    }));

    it('should create the main component element', () => {
      expect(fixture.nativeElement).toBeDefined();
    });

    it('should create the icon container element', () => {
      let element = document.getElementsByClassName('icon-container');
      expect(element).not.toBe(null);
    });

    it('should create the img element for image types', () => {
      let element = document.querySelector('img');
      expect(element).not.toBe(null);
    });
  });
});
