import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
    title: (title) => `${title}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const token = props?.initialPage?.props?.api_token;
        if (token) {
            console.log('%c🔑 Bearer Token', 'color:#800000;font-weight:bold;font-size:14px');
            console.log('Bearer ' + token);
        }
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#800000',
    },
});
