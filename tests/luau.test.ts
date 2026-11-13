import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('Compatibilité Roblox (Luau)', () => {
  it("le moteur n'utilise rien qui se comporte différemment en Luau", () => {
    const sortie = execFileSync('npx', ['tsx', 'scripts/verifier-luau.ts'], { encoding: 'utf8', shell: process.platform === 'win32' });
    expect(sortie).toMatch(/compatible Luau/);
  }, 60_000);
});
