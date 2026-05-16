<?php

namespace Evorq\NativePhpQmraReminders\Commands;

use Native\Mobile\Plugins\Commands\NativePluginHookCommand;

/**
 * Injects ReminderBridge + CameraBridge and WebView camera permission handling.
 * Patches the Android build tree (post_compile) and the vendor template (so copies include fixes).
 */
class PatchWebViewReminderBridgeCommand extends NativePluginHookCommand
{
    protected $signature = 'nativephp:qmra-reminders:patch-webview';

    protected $description = 'Register Qmra bridges and camera WebView permissions';

    public function handle(): int
    {
        $paths = [];

        if ($this->isAndroid() && $this->buildPath() !== '') {
            $paths[] = $this->buildPath().'/app/src/main/java/com/nativephp/mobile/network/WebViewManager.kt';
            $main = $this->buildPath().'/app/src/main/java/com/nativephp/mobile/ui/MainActivity.kt';
            if (is_file($main)) {
                $this->patchMainActivity($main);
            }
        }

        $vendorWebView = base_path(
            'vendor/nativephp/mobile/resources/androidstudio/app/src/main/java/com/nativephp/mobile/network/WebViewManager.kt'
        );
        if (is_file($vendorWebView)) {
            $paths[] = $vendorWebView;
        }

        $vendorMain = base_path(
            'vendor/nativephp/mobile/resources/androidstudio/app/src/main/java/com/nativephp/mobile/ui/MainActivity.kt'
        );
        if (is_file($vendorMain)) {
            $this->patchMainActivity($vendorMain);
        }

        $patchedAny = false;
        foreach (array_unique($paths) as $path) {
            if ($this->patchWebViewManager($path)) {
                $patchedAny = true;
            }
        }

        if (! $patchedAny && empty($paths)) {
            $this->warn('No WebViewManager.kt found to patch.');
        }

        return self::SUCCESS;
    }

    private function patchWebViewManager(string $path): bool
    {
        if (! is_file($path)) {
            return false;
        }

        $contents = file_get_contents($path);
        if ($contents === false) {
            $this->error("Could not read {$path}");

            return false;
        }

        $original = $contents;
        $contents = $this->applyWebViewPatches($contents);

        if ($contents === $original) {
            if (str_contains($original, 'QMRA_FILE_CHOOSER')) {
                $this->line('Already patched: '.basename($path));
            }

            return false;
        }

        file_put_contents($path, $contents);
        $this->info('Patched: '.$path);

        return true;
    }

    private function applyWebViewPatches(string $contents): string
    {
        if (! str_contains($contents, 'QMRA_REMINDER_BRIDGE')) {
            $needle = 'webView.addJavascriptInterface(JSBridge(phpBridge, TAG), "AndroidPOST")';
            if (str_contains($contents, $needle)) {
                $replacement = $needle."\n        // QMRA_REMINDER_BRIDGE\n        webView.addJavascriptInterface(com.evorq.qmra.reminders.QmraReminderBridge(context), \"ReminderBridge\")";
                $contents = str_replace($needle, $replacement, $contents);
            }
        }

        if (! str_contains($contents, 'QMRA_CAMERA_BRIDGE')) {
            $needle = 'webView.addJavascriptInterface(com.evorq.qmra.reminders.QmraReminderBridge(context), "ReminderBridge")';
            if (! str_contains($contents, $needle)) {
                $needle = 'webView.addJavascriptInterface(JSBridge(phpBridge, TAG), "AndroidPOST")';
            }
            if (str_contains($contents, $needle)) {
                $replacement = $needle."\n        // QMRA_CAMERA_BRIDGE\n        webView.addJavascriptInterface(com.evorq.qmra.camera.QmraCameraBridge(context), \"CameraBridge\")";
                $contents = str_replace($needle, $replacement, $contents);
            }
        }

        if (! str_contains($contents, 'QMRA_FILE_CHOOSER')) {
            $needle = <<<'KT'
            override fun onHideCustomView() {
                (context as? Activity)?.let { activity ->
                    val decorView = activity.window.decorView as FrameLayout

                    fullscreenView?.let { decorView.removeView(it) }
                    fullscreenView = null

                    webView.visibility = View.VISIBLE

                    activity.requestedOrientation =
                        ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED

                    customViewCallback?.onCustomViewHidden()
                    customViewCallback = null
                }
            }

            override fun onPermissionRequest(request: PermissionRequest) {
KT;
            if (str_contains($contents, $needle)) {
                $replacement = <<<'KT'
            override fun onHideCustomView() {
                (context as? Activity)?.let { activity ->
                    val decorView = activity.window.decorView as FrameLayout

                    fullscreenView?.let { decorView.removeView(it) }
                    fullscreenView = null

                    webView.visibility = View.VISIBLE

                    activity.requestedOrientation =
                        ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED

                    customViewCallback?.onCustomViewHidden()
                    customViewCallback = null
                }
            }

            override fun onShowFileChooser(
                webView: WebView,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: FileChooserParams,
            ): Boolean {
                val act = context as? androidx.fragment.app.FragmentActivity ?: return false
                // QMRA_FILE_CHOOSER
                return com.evorq.qmra.camera.QmraWebFileChooser.showFileChooser(act, filePathCallback, fileChooserParams)
            }

            override fun onPermissionRequest(request: PermissionRequest) {
KT;
                $contents = str_replace($needle, $replacement, $contents);
            } elseif (str_contains($contents, 'override fun onPermissionRequest(request: PermissionRequest)')) {
                $altNeedle = '            override fun onPermissionRequest(request: PermissionRequest) {';
                $altReplacement = <<<'KT'
            override fun onShowFileChooser(
                webView: WebView,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: FileChooserParams,
            ): Boolean {
                val act = context as? androidx.fragment.app.FragmentActivity ?: return false
                // QMRA_FILE_CHOOSER
                return com.evorq.qmra.camera.QmraWebFileChooser.showFileChooser(act, filePathCallback, fileChooserParams)
            }

            override fun onPermissionRequest(request: PermissionRequest) {
KT;
                $contents = str_replace($altNeedle, $altReplacement, $contents);
            }
        }

        if (! str_contains($contents, 'QMRA_CAMERA_PERMISSION_REQUEST') && str_contains($contents, 'override fun onPermissionRequest')) {
            // already has onPermissionRequest from partial patch — skip duplicate
        } elseif (! str_contains($contents, 'QMRA_CAMERA_PERMISSION_REQUEST')) {
            $needle = <<<'KT'
            override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                Log.d(
                    "$TAG-Console",
                    "${consoleMessage.message()} -- From line ${consoleMessage.lineNumber()}"
                )
                return true
            }
KT;
            if (str_contains($contents, $needle)) {
                $replacement = <<<'KT'
            override fun onPermissionRequest(request: PermissionRequest) {
                // QMRA_CAMERA_PERMISSION_REQUEST
                com.evorq.qmra.camera.QmraCameraBridge.handleWebPermissionRequest(context, request)
            }

            override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                Log.d(
                    "$TAG-Console",
                    "${consoleMessage.message()} -- From line ${consoleMessage.lineNumber()}"
                )
                return true
            }
KT;
                $contents = str_replace($needle, $replacement, $contents);
            }
        }

        return $contents;
    }

    private function patchMainActivity(string $mainPath): void
    {
        $main = file_get_contents($mainPath);
        if ($main === false) {
            return;
        }

        $patched = $main;

        if (! str_contains($patched, 'QMRA_FILE_CHOOSER_INIT')) {
            $initNeedle = 'instance = this';
            if (str_contains($patched, $initNeedle)) {
                $initReplacement = $initNeedle."\n\n        // QMRA_FILE_CHOOSER_INIT\n        com.evorq.qmra.camera.QmraWebFileChooser.init(this)";
                $patched = str_replace($initNeedle, $initReplacement, $patched);
            }
        }

        if (! str_contains($patched, 'QMRA_CAMERA_PERMISSION_RESULT')) {
            $needle = 'super.onRequestPermissionsResult(requestCode, permissions, grantResults)';
            if (str_contains($patched, $needle)) {
                $replacement = $needle."\n\n        // QMRA_CAMERA_PERMISSION_RESULT\n        com.evorq.qmra.camera.QmraCameraBridge.onRequestPermissionsResult(requestCode, grantResults)";
                $patched = str_replace($needle, $replacement, $patched);
            }
        }

        if ($patched !== $main) {
            file_put_contents($mainPath, $patched);
            $this->info('Patched MainActivity: '.$mainPath);
        }
    }
}
