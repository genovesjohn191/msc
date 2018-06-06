export class McsOverlayState {
  public hasBackdrop: boolean;
  public pointerEvents: 'none' | 'auto';
  public backdropColor: 'none' | 'light' | 'dark' | 'black';

  constructor() {
    this.hasBackdrop = true;
    this.pointerEvents = 'auto';
    this.backdropColor = 'none';
  }
}
