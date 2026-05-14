package com.evorq.qmra.reminders

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.nativephp.mobile.ui.MainActivity

class ReminderAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra(EXTRA_TITLE) ?: "قمرة"
        val body = intent.getStringExtra(EXTRA_BODY) ?: ""
        val url = intent.getStringExtra(EXTRA_URL) ?: "/"

        ensureChannel(context)

        val tapIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("notification_url", url)
        }
        val tapPending = PendingIntent.getActivity(
            context,
            (intent.getStringExtra(EXTRA_ID) ?: "0").hashCode() and 0x7fff_fffe,
            tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setContentIntent(tapPending)
            .setAutoCancel(true)
            .build()

        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val nid = (intent.getStringExtra(EXTRA_ID) ?: "0").hashCode() and 0x7fff_ffff
        nm.notify(nid, notification)
    }

    companion object {
        const val CHANNEL_ID = "qmra_reminders"
        const val EXTRA_ID = "reminder_id"
        const val EXTRA_TITLE = "title"
        const val EXTRA_BODY = "body"
        const val EXTRA_URL = "url"

        fun ensureChannel(context: Context) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                return
            }
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (nm.getNotificationChannel(CHANNEL_ID) != null) {
                return
            }
            val ch = NotificationChannel(
                CHANNEL_ID,
                "تنبيهات قمرة",
                NotificationManager.IMPORTANCE_HIGH,
            ).apply {
                description = "تذكيرات الصيانة والملاحظات والضمان"
                enableVibration(true)
            }
            nm.createNotificationChannel(ch)
        }
    }
}
