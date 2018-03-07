import {
  async,
  TestBed,
  getTestBed,
  ComponentFixture
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ImageComponent } from './image.component';
import { ImageService } from './image.service';
import { CoreDefinition } from '../../core';
import { CoreTestingModule } from '../../core/testing';

describe('ImageComponent', () => {

  /** Stub Services/Components */
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<ImageComponent>;
  let component: ImageComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ImageComponent
      ],
      imports: [
        CoreTestingModule
      ],
      providers: [
        ImageService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ImageComponent, {
      set: {
        template: `
          <div>Image creation based on type</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      httpMock = getTestBed().get(HttpTestingController);
      fixture = TestBed.createComponent(ImageComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnChanges() when image type is SVG', () => {
    beforeEach(async(() => {
      component.key = CoreDefinition.ASSETS_IMAGE_MCS_LIGHT_LOGO_SVG;
      component.size = 'small';
      component.ngOnChanges();
    }));

    it('should create the main component element', () => {
      expect(fixture.nativeElement).toBeDefined();
    });

    it('should create the image container element', () => {
      let element = document.getElementsByClassName('image-container');
      expect(element).not.toBe(null);
    });

    it('should create the svg element', () => {
      // Create mock for HTTP client
      let mockRequest = httpMock.expectOne(`assets/img//light-mcs-logo.svg`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create element for response
      let svgElement = '<svg><title>Svg Content</title></svg>';
      mockRequest.flush(svgElement);

      // Expect the response
      let element = document.querySelector('svg');
      expect(element).not.toBe(null);
    });
  });

  describe('ngOnChanges() when image type is other type than SVG', () => {
    beforeEach(async(() => {
      component.key = CoreDefinition.ASSETS_IMAGE_MCS_LIGHT_LOGO;
      component.size = 'small';
      component.ngOnChanges();
    }));

    it('should create the main component element', () => {
      expect(fixture.nativeElement).toBeDefined();
    });

    it('should create the image container element', () => {
      let element = document.getElementsByClassName('image-container');
      expect(element).not.toBe(null);
    });

    it('should create the img element', () => {
      let element = document.querySelector('img');
      expect(element).not.toBe(null);
    });
  });
});
