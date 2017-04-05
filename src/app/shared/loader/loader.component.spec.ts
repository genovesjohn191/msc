import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { Renderer } from '@angular/core';

import { LoaderComponent } from './loader.component';
import { AssetsProvider } from '../../core/providers/assets.provider';

describe('LoaderComponent', () => {

  /** Stub Services/Components */
  let component: LoaderComponent;
  let mockAssetsProvider = {
    getImagePath(key: string): string {
      let images = {
        loader: 'spinner.gif'
      };

      return images[key];
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        LoaderComponent
      ],
      imports: [
      ],
      providers: [
        { provide: AssetsProvider, useValue: mockAssetsProvider },
        Renderer
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(LoaderComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(LoaderComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should return the image path if the key provided is valid', () => {
      component.key = 'loader';
      component.ngOnInit();
      expect(component.loaderImage).toBeDefined();
    });
  });

});
