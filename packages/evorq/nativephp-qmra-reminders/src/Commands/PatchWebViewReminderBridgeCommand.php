<?php

namespace Evorq\NativePhpQmraReminders\Commands;

use Native\Mobile\Plugins\Commands\NativePluginHookCommand;

/**
 * Injects ReminderBridge into NativePHP WebViewManager after plugin sources compile.
 */
class PatchWebViewReminderBridgeCommand extends NativePluginHookCommand
{
    protected $signature = 'nativephp:qmra-reminders:patch-webview';

    protected $description = 'Register Qmra ReminderBridge on the Android WebView (post_compile hook)';

    public function handle(): int
    {
        if (! $this->isAndroid()) {
            return self::SUCCESS;
        }

        $path = $this->buildPath().'/app/src/main/java/com/nativephp/mobile/network/WebViewManager.kt';
        if (! is_file($path)) {
            $this->warn("WebViewManager.kt not found at {$path}");

            return self::SUCCESS;
        }

        $contents = file_get_contents($path);
        if ($contents === false) {
            $this->error('Could not read WebViewManager.kt');

            return self::FAILURE;
        }

        if (str_contains($contents, 'QMRA_REMINDER_BRIDGE')) {
            $this->info('ReminderBridge already patched.');

            return self::SUCCESS;
        }

        $needle = 'webView.addJavascriptInterface(JSBridge(phpBridge, TAG), "AndroidPOST")';
        if (! str_contains($contents, $needle)) {
            $this->error('Expected WebViewManager setupJavaScriptInterfaces snippet not found; NativePHP may have changed.');

            return self::FAILURE;
        }

        $replacement = $needle."\n        // QMRA_REMINDER_BRIDGE\n        webView.addJavascriptInterface(com.evorq.qmra.reminders.QmraReminderBridge(context), \"ReminderBridge\")";
        $new = str_replace($needle, $replacement, $contents);
        if ($new === $contents) {
            $this->error('Patch replace produced no changes.');

            return self::FAILURE;
        }

        file_put_contents($path, $new);
        $this->info('Patched WebViewManager.kt with ReminderBridge.');

        return self::SUCCESS;
    }
}
