<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
        @php
            $host = request()->getHost();
            $onesignalWeb = $host === 'app.qmra.ae'
                || in_array($host, ['127.0.0.1', 'localhost', '10.0.2.2'], true)
                || filter_var($host, FILTER_VALIDATE_IP)
                || (bool) env('ONESIGNAL_WEB_SDK', false);
            $onesignalAppId = env('ONESIGNAL_APP_ID', 'd931525f-d834-404e-ac9d-2637743cca16');
        @endphp
        @if($onesignalWeb && $onesignalAppId)
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
        <script>
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({ appId: "{{ $onesignalAppId }}" });
                @auth
                OneSignal.login("{{ Auth::id() }}");
                @endauth
            });
        </script>
        @endif
        <script>

            // Native Android push (NativePHP APK) — bridge injected by MainActivity.kt
            @auth
            (function() {
                var userId = "{{ Auth::id() }}";
                function linkNative() {
                    if (window.OneSignalBridge && userId) {
                        window.OneSignalBridge.setExternalUserId(userId);
                    }
                }
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', linkNative);
                } else {
                    linkNative();
                }
            })();
            @endauth
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
{{-- here --}}