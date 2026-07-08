let betaActive = false;

export function isBeta(): boolean { return betaActive; }
export function activateBeta(): void { betaActive = true; }
export function deactivateBeta(): void { betaActive = false; }
