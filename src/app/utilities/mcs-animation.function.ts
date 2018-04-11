import { AnimationTriggerMetadata } from '@angular/animations';

// Factories
import { fade } from './animations/fade';
import { expansion } from './animations/expansion';
import { rotate } from './animations/rotate';
import { transform } from './animations/transform';
import { scale } from './animations/scale';

/**
 * Returns the animate factory instances
 * @example Usage: <ng-container [expansionVertical]> </ng-container>
 */
export const animateFactory: {
  readonly fadeIn: AnimationTriggerMetadata;
  readonly transformVertical: AnimationTriggerMetadata;
  readonly expansionVertical: AnimationTriggerMetadata;
  readonly rotate180: AnimationTriggerMetadata;
  readonly scaleIn: AnimationTriggerMetadata;
} = {
    fadeIn: fade.fadeIn,
    transformVertical: transform.transformVertical,
    expansionVertical: expansion.expansionVertical,
    rotate180: rotate.rotate180,
    scaleIn: scale.scaleIn,
  };
