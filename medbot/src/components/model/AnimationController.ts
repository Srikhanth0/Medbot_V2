import { useEffect } from 'react';
import * as THREE from 'three';

export class AnimationController {
  mixer: THREE.AnimationMixer;
  actions: Record<string, THREE.AnimationAction> = {};
  currentAction: THREE.AnimationAction | null = null;

  constructor(mixer: THREE.AnimationMixer) {
    this.mixer = mixer;
  }

  addAction(name: string, clip: THREE.AnimationClip) {
    const action = this.mixer.clipAction(clip);
    this.actions[name] = action;
  }

  playAction(name: string, fadeDuration: number = 0.5) {
    const nextAction = this.actions[name];
    if (!nextAction || this.currentAction === nextAction) return;

    if (this.currentAction) {
      this.currentAction.fadeOut(fadeDuration);
    }

    nextAction.reset().fadeIn(fadeDuration).play();
    this.currentAction = nextAction;
  }

  update(delta: number) {
    this.mixer.update(delta);
  }
}

export function useAnimationController(mixer: THREE.AnimationMixer) {
  // A hook wrapper if needed, but typically you manage it in a component.
  // We'll keep the class pattern for standard usage.
}
