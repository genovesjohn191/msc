import { AnimationTriggerMetadata } from '@angular/animations';

// Constants
export * from './animations/constants';

// Factories
import { fade } from './animations/fade';
import { slide } from './animations/slide';
import { expansion } from './animations/expansion';
import { rotate } from './animations/rotate';
import { transform } from './animations/transform';
import { scale } from './animations/scale';

/**
 * Returns the animate factory instances
 * @example Usage: <ng-container [expansionVertical]> </ng-container>
 */
export const animateFactory: {
  readonly fadeInOut: AnimationTriggerMetadata;
  readonly fadeIn: AnimationTriggerMetadata;
  readonly fadeOut: AnimationTriggerMetadata;
  readonly slideLeft: AnimationTriggerMetadata;
  readonly slideRight: AnimationTriggerMetadata;
  readonly slideTop: AnimationTriggerMetadata;
  readonly slideBottom: AnimationTriggerMetadata;
  readonly transformVertical: AnimationTriggerMetadata;
  readonly expansionVertical: AnimationTriggerMetadata;
  readonly rotate45: AnimationTriggerMetadata;
  readonly rotate90: AnimationTriggerMetadata;
  readonly rotate180: AnimationTriggerMetadata;
  readonly scaleIn: AnimationTriggerMetadata;
} = {
    fadeInOut: fade.fadeInOut,
    fadeIn: fade.fadeIn,
    fadeOut: fade.fadeOut,
    slideLeft: slide.slideLeft,
    slideRight: slide.slideRight,
    slideTop: slide.slideTop,
    slideBottom: slide.slideBottom,
    transformVertical: transform.transformVertical,
    expansionVertical: expansion.expansionVertical,
    rotate45: rotate.rotate45,
    rotate90: rotate.rotate90,
    rotate180: rotate.rotate180,
    scaleIn: scale.scaleIn,
  };
