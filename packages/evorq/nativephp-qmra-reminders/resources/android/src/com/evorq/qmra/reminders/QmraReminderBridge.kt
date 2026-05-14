package com.evorq.qmra.reminders

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.JavascriptInterface
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.nativephp.mobile.ui.MainActivity
import java.util.Calendar

/**
 * Exposed to the WebView as window.ReminderBridge (see WebViewManager post_compile patch).
 * Schedules exact alarms via AlarmManager.setAlarmClock (no cloud / FCM).
 */
class QmraReminderBridge(private val context: Context) {

    @JavascriptInterface
    fun scheduleReminder(id: String, title: String, body: String, date: String, time: String, path: String) {
        Handler(Looper.getMainLooper()).post {
            try {
                maybeRequestPostNotificationPermission()
                ReminderAlarmReceiver.ensureChannel(context)

                val triggerAt = parseTriggerMillis(date, time)
                if (triggerAt <= System.currentTimeMillis()) {
                    Log.w(TAG, "scheduleReminder: skip past trigger id=$id")
                    return@post
                }

                val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

                val broadcast = Intent(context, ReminderAlarmReceiver::class.java).apply {
                    putExtra(ReminderAlarmReceiver.EXTRA_ID, id)
                    putExtra(ReminderAlarmReceiver.EXTRA_TITLE, title)
                    putExtra(ReminderAlarmReceiver.EXTRA_BODY, body)
                    putExtra(ReminderAlarmReceiver.EXTRA_URL, normalizePath(path))
                }

                val req = stableRequestCode(id)
                val operation = PendingIntent.getBroadcast(
                    context,
                    req,
                    broadcast,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )

                val showIntent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("notification_url", normalizePath(path))
                }
                val showOperation = PendingIntent.getActivity(
                    context,
                    req + 100_000,
                    showIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )

                val info = AlarmManager.AlarmClockInfo(triggerAt, showOperation)
                am.setAlarmClock(info, operation)
                Log.d(TAG, "Scheduled reminder id=$id at=$triggerAt")
            } catch (e: Exception) {
                Log.e(TAG, "scheduleReminder failed: ${e.message}", e)
            }
        }
    }

    @JavascriptInterface
    fun cancelReminder(id: String) {
        Handler(Looper.getMainLooper()).post {
            try {
                val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                val broadcast = Intent(context, ReminderAlarmReceiver::class.java)
                val operation = PendingIntent.getBroadcast(
                    context,
                    stableRequestCode(id),
                    broadcast,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )
                am.cancel(operation)
                operation.cancel()

                val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
                nm.cancel(id.hashCode() and 0x7fff_ffff)
                Log.d(TAG, "Cancelled reminder id=$id")
            } catch (e: Exception) {
                Log.e(TAG, "cancelReminder failed: ${e.message}", e)
            }
        }
    }

    private fun maybeRequestPostNotificationPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            return
        }
        val act = MainActivity.instance ?: return
        if (ContextCompat.checkSelfPermission(act, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
            return
        }
        ActivityCompat.requestPermissions(act, arrayOf(Manifest.permission.POST_NOTIFICATIONS), REQ_POST_NOTIFICATIONS)
    }

    private fun parseTriggerMillis(dateStr: String, timeStr: String): Long {
        val parts = dateStr.split("-").mapNotNull { it.toIntOrNull() }
        if (parts.size != 3) {
            return -1L
        }
        var t = timeStr.trim().ifBlank { "09:00" }
        if (t.length == 5) {
            t = "$t:00"
        }
        val tp = t.split(":").mapNotNull { it.toIntOrNull() }
        val hour = tp.getOrNull(0) ?: 9
        val minute = tp.getOrNull(1) ?: 0
        val second = tp.getOrNull(2) ?: 0

        val cal = Calendar.getInstance()
        cal.set(Calendar.YEAR, parts[0])
        cal.set(Calendar.MONTH, parts[1] - 1)
        cal.set(Calendar.DAY_OF_MONTH, parts[2])
        cal.set(Calendar.HOUR_OF_DAY, hour)
        cal.set(Calendar.MINUTE, minute)
        cal.set(Calendar.SECOND, second)
        cal.set(Calendar.MILLISECOND, 0)
        return cal.timeInMillis
    }

    private fun normalizePath(path: String): String {
        if (path.isBlank()) {
            return "/"
        }
        return if (path.startsWith("/")) path else "/$path"
    }

    private fun stableRequestCode(id: String): Int = id.hashCode() and 0x7fff_fffe

    companion object {
        private const val TAG = "QmraReminderBridge"
        private const val REQ_POST_NOTIFICATIONS = 71041
    }
}
