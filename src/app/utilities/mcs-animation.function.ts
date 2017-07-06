import {
  trigger,
  AnimationTriggerMetadata
} from '@angular/animations';

import { fade } from './animations/fade';
import { slide } from './animations/slide';

/**
 * Interface for the animation parameter
 */
export interface AnimationParameter {
  duration?: string | number;
  delay?: string | number;
  easing?: string;
}

/**
 * This will include the different kinds of animation
 * that can be add in ur styling
 * * Note: Include this component in the animation of component
 * to get all the animation property
 * @param duration Duration of the animation before it completes
 * @param delay Delay time for the animation before it starts
 * @param easing Easing of the animation style
 */
export function animateFactory(attributes: AnimationParameter): AnimationTriggerMetadata {

  // Set default values for attributes
  if (attributes) {
    attributes.duration = attributes.duration ? attributes.duration : 500;
    attributes.delay = attributes.delay ? attributes.delay : 0;
    attributes.easing = attributes.easing ? attributes.easing : 'linear';
  }

  // Set the timing for the animation
  let timing: string = [
    typeof (attributes.duration) === 'number' ? `${attributes.duration}ms` : attributes.duration,
    typeof (attributes.delay) === 'number' ? `${attributes.delay}ms` : attributes.delay,
    attributes.easing
  ].join(' ');

  // Return all the animation trigger element
  return trigger('animate', [
    ...fade(timing),
    ...slide(timing)
  ]);
}
