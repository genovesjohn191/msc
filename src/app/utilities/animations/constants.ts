/**
 * Animations curves constants in cubic bezier
 */
export const animationCurves: {
  readonly standard: string;
  readonly deceleration: string;
  readonly acceleration: string;
  readonly sharp: string;
} = {
    standard: 'cubic-bezier(0.4,0.0,0.2,1)',
    deceleration: 'cubic-bezier(0.4,0.0,0.2,1)',
    acceleration: 'cubic-bezier(0.4,0.0,1,1)',
    sharp: 'cubic-bezier(0.4,0.0,0.6,1)'
  };

/**
 * Animation durations constants in milli-seconds
 */
export const animationDurations: {
  readonly complex: string;
  readonly entering: string;
  readonly exiting: string;
} = {
  complex: '375ms',
  entering: '225ms',
  exiting: '195ms',
};
