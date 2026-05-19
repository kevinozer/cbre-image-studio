/**
 * Tiny conditional class joiner ('cn'). Replaces clsx for our use.
 */
export function cn(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}
