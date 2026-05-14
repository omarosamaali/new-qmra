<?php

namespace Evorq\NativePhpQmraReminders;

use Evorq\NativePhpQmraReminders\Commands\PatchWebViewReminderBridgeCommand;
use Illuminate\Support\ServiceProvider;

class QmraRemindersServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->commands([
            PatchWebViewReminderBridgeCommand::class,
        ]);
    }
}
