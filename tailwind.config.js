/**
 * Helper - generate Tailwind color reading the rgb-triplet CSS variable.
 * Resulting class supports alpha modifiers (bg-surface-page/50 etc).
 */
var cssVar = function (name) { return "rgb(var(--color-".concat(name, ") / <alpha-value>)"); };
export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: cssVar('brand-primary'),
                    primaryHover: cssVar('brand-primaryHover'),
                    green: cssVar('brand-green'),
                    greenDeep: '#1E8B5A',
                    greenTint: cssVar('brand-greenTint'),
                },
                accent: {
                    blue: '#3E7CB1',
                    blueTint: '#E5EEF6',
                    orange: '#E89232',
                    orangeTint: '#FDF1DC',
                },
                surface: {
                    page: cssVar('surface-page'),
                    card: cssVar('surface-card'),
                    heroDark: cssVar('surface-heroDark'),
                    muted: cssVar('surface-muted'),
                },
                ink: {
                    onDark: '#FFFFFF',
                    primary: cssVar('ink-primary'),
                    secondary: cssVar('ink-secondary'),
                    muted: cssVar('ink-muted'),
                    disabled: cssVar('ink-disabled'),
                },
                outline: cssVar('outline'),
            },
            fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
            fontSize: {
                h1: ['clamp(28px, 3vw + 16px, 56px)', { lineHeight: '1.1', fontWeight: '800' }],
                h2: ['clamp(20px, 1vw + 14px, 28px)', { lineHeight: '1.3', fontWeight: '700' }],
                h3: ['clamp(15px, 0.5vw + 12px, 18px)', { lineHeight: '1.4', fontWeight: '600' }],
                body: ['clamp(13px, 0.2vw + 11px, 15px)', { lineHeight: '1.5', fontWeight: '400' }],
                meta: ['clamp(10px, 0.1vw + 9px, 11px)', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '0.06em' }],
            },
            spacing: {
                'section-gap': 'clamp(16px, 2vw + 8px, 32px)',
                'card-pad': 'clamp(14px, 1vw + 8px, 28px)',
                'grid-gap': 'clamp(10px, 1vw + 4px, 20px)',
                'navbar-h': 'clamp(48px, 4vw + 16px, 64px)',
            },
            maxWidth: { container: '1200px' },
            borderRadius: { card: '16px', input: '8px' },
            boxShadow: {
                card: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
                modal: '0 20px 40px rgba(0,0,0,0.18)',
            },
        },
    },
    plugins: [],
};
