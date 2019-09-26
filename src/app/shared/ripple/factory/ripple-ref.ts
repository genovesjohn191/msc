import { RippleConfig } from './ripple-config';
import { RippleState } from './ripple-state.enum';

/**
 * Reference to a previously launched ripple element.
 */
export class RippleRef {

  /** Current state of the ripple reference. */
  public state: RippleState = RippleState.Hidden;

  constructor(
    public element: HTMLElement,
    public config: RippleConfig
  ) { }
}
