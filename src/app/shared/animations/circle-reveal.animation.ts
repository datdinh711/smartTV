import {
  AnimationTriggerMetadata,
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

// ── Two-Stage Transition: Introduction → IntroductionVideo ───────────────────
//
// STAGE 1 — circlePullUpAnimation  (lives on IntroductionComponent)
//   Triggered by *ngIf when the user clicks "Watch Video".
//   A full-screen overlay rises from the bottom of the viewport while a
//   circular clip-path expands from a point at the bottom-centre until it
//   covers the entire screen (150 % radius = covers all 16:9 corners).
//   When the animation finishes (@circlePullUp.done), the component navigates.
//
//   Binding pattern:
//     <div *ngIf="isCircleActive" class="circle-overlay"
//          [@circlePullUp]="'active'"
//          (@circlePullUp.done)="onCircleDone()">
//     </div>
//
// STAGE 2 — doorLeftAnimation / doorRightAnimation  (live on IntroductionVideoComponent)
//   The video component mounts with two panels ('closed') covering the screen
//   — visually continuing the dark shell from Stage 1.
//   ngAfterViewInit sets animPhase = 'open', triggering both doors to slide
//   away simultaneously (800 ms) and reveal the video.
//
//   Binding pattern:
//     <div class="door door-left"  [@doorLeft]="animPhase"  (@doorLeft.done)="onDoorDone($event)">
//     <div class="door door-right" [@doorRight]="animPhase">
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Stage 1: circle pull-up (IntroductionComponent) ─────────────────────────
//
// State 'active' is the only real state — it represents the final fully-expanded
// circle.  The animation fires via void → 'active' when the *ngIf element
// enters the DOM.
export const circlePullUpAnimation: AnimationTriggerMetadata = trigger('circlePullUp', [
  state('active', style({
    transform: 'translateY(0)',
    clipPath: 'circle(150% at 50% 50%)',
  })),

  transition('void => active', [
    style({
      transform: 'translateY(100%)',
      clipPath: 'circle(0% at 50% 100%)',
    }),
    animate('1000ms ease-out'),
  ]),
]);

// ── Stage 2a: left door slides out (IntroductionVideoComponent) ──────────────
export const doorLeftAnimation: AnimationTriggerMetadata = trigger('doorLeft', [
  state('closed', style({ transform: 'translateX(0)' })),
  state('open',   style({ transform: 'translateX(-100%)' })),
  transition('closed => open', animate('800ms ease-out')),
]);

// ── Stage 2b: right door slides out (IntroductionVideoComponent) ─────────────
export const doorRightAnimation: AnimationTriggerMetadata = trigger('doorRight', [
  state('closed', style({ transform: 'translateX(0)' })),
  state('open',   style({ transform: 'translateX(100%)' })),
  transition('closed => open', animate('800ms ease-out')),
]);
