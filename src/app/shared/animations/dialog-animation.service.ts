import {
  AnimationTriggerMetadata,
  animate,
  group,
  keyframes,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

/**
 * Feed dialog — slides in from the left like grain flowing through a chute.
 * Grid items cascade upward with a spring stagger.
 */
export const feedDialogAnimation: AnimationTriggerMetadata = trigger('feedDialog', [
  transition(':enter', [
    // Hide sections immediately so they don't flash before the stagger runs
    query('.dialog-section', [
      style({ opacity: 0, transform: 'translateY(32px)' }),
    ], { optional: true }),
    group([
      query('.dialog-overlay', [
        style({ opacity: 0 }),
        animate('220ms ease', style({ opacity: 1 })),
      ], { optional: true }),
      query('.dialog-content', [
        style({ opacity: 0, transform: 'translateX(-80px) scale(0.94)' }),
        animate(
          '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'translateX(0) scale(1)' }),
        ),
      ], { optional: true }),
    ]),
    query('.dialog-section', [
      stagger(90, [
        animate(
          '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ], { optional: true }),
  ]),
  transition(':leave', [
    group([
      query('.dialog-content', [
        animate(
          '180ms ease-in',
          style({ opacity: 0, transform: 'translateX(-56px) scale(0.94)' }),
        ),
      ], { optional: true }),
      query('.dialog-overlay', [
        animate('180ms ease', style({ opacity: 0 })),
      ], { optional: true }),
    ]),
  ]),
]);

/**
 * Farm dialog — blooms from the center like a seedling breaking through soil.
 * A spring overshoot gives it a natural, organic feel.
 * Grid items scale in with a staggered pop.
 */
export const farmDialogAnimation: AnimationTriggerMetadata = trigger('farmDialog', [
  transition(':enter', [
    query('.dialog-section', [
      style({ opacity: 0, transform: 'scale(0.75) translateY(24px)' }),
    ], { optional: true }),
    group([
      query('.dialog-overlay', [
        style({ opacity: 0 }),
        animate('220ms ease', style({ opacity: 1 })),
      ], { optional: true }),
      query('.dialog-content', [
        animate(
          '440ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          keyframes([
            style({ opacity: 0, transform: 'scale(0.5) rotate(-4deg)', offset: 0 }),
            style({ opacity: 1, transform: 'scale(1.06) rotate(1.5deg)', offset: 0.65 }),
            style({ opacity: 1, transform: 'scale(0.98) rotate(-0.5deg)', offset: 0.82 }),
            style({ opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 1 }),
          ]),
        ),
      ], { optional: true }),
    ]),
    query('.dialog-section', [
      stagger(110, [
        animate(
          '320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }),
        ),
      ]),
    ], { optional: true }),
  ]),
  transition(':leave', [
    group([
      query('.dialog-content', [
        animate(
          '190ms ease-in',
          style({ opacity: 0, transform: 'scale(0.8) rotate(3deg)' }),
        ),
      ], { optional: true }),
      query('.dialog-overlay', [
        animate('190ms ease', style({ opacity: 0 })),
      ], { optional: true }),
    ]),
  ]),
]);

/**
 * Food dialog — drops from above and bounces into place like a dish being served.
 * Grid items fall in from the top with a stagger.
 */
export const foodDialogAnimation: AnimationTriggerMetadata = trigger('foodDialog', [
  transition(':enter', [
    query('.dialog-section', [
      style({ opacity: 0, transform: 'translateY(-22px)' }),
    ], { optional: true }),
    group([
      query('.dialog-overlay', [
        style({ opacity: 0 }),
        animate('220ms ease', style({ opacity: 1 })),
      ], { optional: true }),
      query('.dialog-content', [
        animate(
          '460ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          keyframes([
            style({ opacity: 0, transform: 'translateY(-100px) scale(0.88)', offset: 0 }),
            style({ opacity: 1, transform: 'translateY(14px) scale(1.03)', offset: 0.62 }),
            style({ opacity: 1, transform: 'translateY(-5px) scale(1.01)', offset: 0.80 }),
            style({ opacity: 1, transform: 'translateY(2px) scale(1)', offset: 0.92 }),
            style({ opacity: 1, transform: 'translateY(0) scale(1)', offset: 1 }),
          ]),
        ),
      ], { optional: true }),
    ]),
    query('.dialog-section', [
      stagger(100, [
        animate(
          '310ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ], { optional: true }),
  ]),
  transition(':leave', [
    group([
      query('.dialog-content', [
        animate(
          '190ms ease-in',
          style({ opacity: 0, transform: 'translateY(-60px) scale(0.9)' }),
        ),
      ], { optional: true }),
      query('.dialog-overlay', [
        animate('190ms ease', style({ opacity: 0 })),
      ], { optional: true }),
    ]),
  ]),
]);
