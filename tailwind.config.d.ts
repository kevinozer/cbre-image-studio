declare const _default: {
    content: string[];
    darkMode: "class";
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: string;
                    primaryHover: string;
                    green: string;
                    greenDeep: string;
                    greenTint: string;
                };
                accent: {
                    blue: string;
                    blueTint: string;
                    orange: string;
                    orangeTint: string;
                };
                surface: {
                    page: string;
                    card: string;
                    heroDark: string;
                    muted: string;
                };
                ink: {
                    onDark: string;
                    primary: string;
                    secondary: string;
                    muted: string;
                    disabled: string;
                };
                outline: string;
            };
            fontFamily: {
                sans: [string, string, string];
            };
            fontSize: {
                h1: [string, {
                    lineHeight: string;
                    fontWeight: string;
                }];
                h2: [string, {
                    lineHeight: string;
                    fontWeight: string;
                }];
                h3: [string, {
                    lineHeight: string;
                    fontWeight: string;
                }];
                body: [string, {
                    lineHeight: string;
                    fontWeight: string;
                }];
                meta: [string, {
                    lineHeight: string;
                    fontWeight: string;
                    letterSpacing: string;
                }];
            };
            spacing: {
                'section-gap': string;
                'card-pad': string;
                'grid-gap': string;
                'navbar-h': string;
            };
            maxWidth: {
                container: string;
            };
            borderRadius: {
                card: string;
                input: string;
            };
            boxShadow: {
                card: string;
                modal: string;
            };
        };
    };
    plugins: never[];
};
export default _default;
