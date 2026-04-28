<?php

namespace App\Console\Commands;

use App\Models\Reminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class SendReminderNotifications extends Command
{
    protected $signature   = 'reminders:notify';
    protected $description = 'Send push notifications for upcoming reminders';

    private const ONESIGNAL_APP_ID  = 'd931525f-d834-404e-ac9d-2637743cca16';
    private const ONESIGNAL_API_KEY = 'os_v2_app_3eyvex6ygrae5le5ey3xipgkc3yow3u57kdu4d5no22f2gebtxs4avxx7bmlvmvcut6oueimxulq4kpocc2ijvbu4smvpfk2o4jdpqa';

    public function handle(): void
    {
        $today    = Carbon::today();
        $tomorrow = Carbon::tomorrow();

        // Reminders due today or tomorrow that are not completed
        $reminders = Reminder::with('vehicle')
            ->whereIn('due_date', [$today->toDateString(), $tomorrow->toDateString()])
            ->where('completed', false)
            ->get();

        foreach ($reminders as $reminder) {
            $isToday = Carbon::parse($reminder->due_date)->isToday();
            $when    = $isToday ? 'اليوم' : 'غداً';
            $title   = $reminder->title_ar ?? 'تنبيه صيانة';
            $vehicle = $reminder->vehicle?->name_ar ?? '';

            $this->sendPush(
                userId:  (string) $reminder->user_id,
                title:   "⏰ تنبيه قمرة",
                message: "{$title} — {$vehicle} ({$when})",
            );
        }

        $this->info("Sent notifications for {$reminders->count()} reminders.");
    }

    private function sendPush(string $userId, string $title, string $message): void
    {
        Http::withHeaders([
            'Authorization' => 'Key ' . self::ONESIGNAL_API_KEY,
            'Content-Type'  => 'application/json',
        ])->post('https://onesignal.com/api/v1/notifications', [
            'app_id'                   => self::ONESIGNAL_APP_ID,
            'include_aliases'          => ['external_id' => [$userId]],
            'target_channel'           => 'push',
            'headings'                 => ['en' => $title, 'ar' => $title],
            'contents'                 => ['en' => $message, 'ar' => $message],
            'url'                      => 'https://app.qmra.ae/reminders',
        ]);
    }
}
