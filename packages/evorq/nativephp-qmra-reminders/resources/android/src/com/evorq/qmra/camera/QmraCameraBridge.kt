package com.evorq.qmra.camera

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.nativephp.mobile.ui.MainActivity

/**
 * WebView getUserMedia needs Android CAMERA at runtime plus WebChromeClient.onPermissionRequest.
 * NativePHP v3 MainActivity has no onRequestPermissionsResult — we poll after requesting.
 */
class QmraCameraBridge(private val context: android.content.Context) {

    @JavascriptInterface
    fun hasCameraPermission(): Boolean = isCameraGranted()

    @JavascriptInterface
    fun requestCameraPermission() {
        Handler(Looper.getMainLooper()).post {
            requestCameraPermissionOnMainThread()
        }
    }

    @JavascriptInterface
    fun openImagePickerForQr() {
        Handler(Looper.getMainLooper()).post {
            val act = MainActivity.instance as? FragmentActivity
            if (act == null) {
                QmraWebFileChooser.rejectBridge("unavailable")
                return@post
            }
            QmraWebFileChooser.init(act)
            QmraWebFileChooser.openImagePickerForBridge(act)
        }
    }

    @JavascriptInterface
    fun openAppSettings() {
        Handler(Looper.getMainLooper()).post {
            try {
                val intent = Intent(
                    Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.fromParts("package", context.packageName, null),
                ).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                Log.e(TAG, "openAppSettings failed: ${e.message}", e)
            }
        }
    }

    private fun isCameraGranted(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CAMERA,
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestCameraPermissionOnMainThread() {
        val act = MainActivity.instance as? Activity ?: return
        if (isCameraGranted()) {
            return
        }
        ActivityCompat.requestPermissions(act, arrayOf(Manifest.permission.CAMERA), REQ_CAMERA)
        pollUntilGranted(act, onGranted = {}, onDenied = {}, attempt = 0, forWebRequest = false)
    }

    companion object {
        private const val TAG = "QmraCameraBridge"
        const val REQ_CAMERA = 71042
        private const val POLL_MS = 250L
        private const val MAX_ATTEMPTS = 120 // ~30s

        @Volatile
        var pendingWebPermissionRequest: PermissionRequest? = null

        fun onRequestPermissionsResult(requestCode: Int, grantResults: IntArray) {
            if (requestCode != REQ_CAMERA) {
                return
            }
            val pending = pendingWebPermissionRequest ?: return
            pendingWebPermissionRequest = null
            val granted = grantResults.isNotEmpty() &&
                grantResults[0] == PackageManager.PERMISSION_GRANTED
            if (granted) {
                pending.grant(pending.resources)
            } else {
                pending.deny()
            }
        }

        fun handleWebPermissionRequest(context: android.content.Context, request: PermissionRequest) {
            val act = context as? Activity
            if (act == null) {
                request.deny()
                return
            }
            Handler(Looper.getMainLooper()).post {
                if (ContextCompat.checkSelfPermission(act, Manifest.permission.CAMERA) ==
                    PackageManager.PERMISSION_GRANTED
                ) {
                    request.grant(request.resources)
                    return@post
                }
                pendingWebPermissionRequest = request
                ActivityCompat.requestPermissions(act, arrayOf(Manifest.permission.CAMERA), REQ_CAMERA)
                pollUntilGranted(
                    act,
                    onGranted = {
                        pendingWebPermissionRequest = null
                        request.grant(request.resources)
                    },
                    onDenied = {
                        pendingWebPermissionRequest = null
                        request.deny()
                    },
                    attempt = 0,
                    forWebRequest = true,
                )
            }
        }

        private fun pollUntilGranted(
            act: Activity,
            onGranted: () -> Unit,
            onDenied: () -> Unit,
            attempt: Int,
            forWebRequest: Boolean,
        ) {
            if (ContextCompat.checkSelfPermission(act, Manifest.permission.CAMERA) ==
                PackageManager.PERMISSION_GRANTED
            ) {
                onGranted()
                return
            }
            if (attempt >= MAX_ATTEMPTS) {
                Log.w(TAG, "Camera permission poll timed out (web=$forWebRequest)")
                onDenied()
                return
            }
            Handler(Looper.getMainLooper()).postDelayed({
                pollUntilGranted(act, onGranted, onDenied, attempt + 1, forWebRequest)
            }, POLL_MS)
        }
    }
}
