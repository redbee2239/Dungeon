let betaActive = false;

export function isBeta(): boolean { return betaActive; }
export function activateBeta(): void { betaActive = true; }
export function deactivateBeta(): void { betaActive = false; }

export function isSecretChannel(channelId: string): boolean {
  const secretId = process.env.SECRET_CHANNEL_ID?.trim();
  return !!secretId && channelId === secretId;
}
