import { RippleConfig } from './ripple-config';
import { RippleState } from './ripple-state.enum';
import { RippleRenderer } from './ripple-renderer';

/**
 * Reference to a previously launched ripple element.
 */
export class RippleRef {

  /** Current state of the ripple reference. */
  public state: RippleState = RippleState.Hidden;

  constructor(
    private _renderer: RippleRenderer,
    public element: HTMLElement,
    public config: RippleConfig) {
  }

  /**
   * Fades out the ripple element.
   */
  public fadeOut() {
    this._renderer.fadeOutRipple(this);
  }
}
