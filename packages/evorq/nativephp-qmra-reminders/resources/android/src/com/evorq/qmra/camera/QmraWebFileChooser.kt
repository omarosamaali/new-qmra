package com.evorq.qmra.camera

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.Base64
import android.util.Log
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.fragment.app.FragmentActivity
import com.nativephp.mobile.ui.MainActivity
import java.io.ByteArrayOutputStream
import java.io.File

/**
 * Android WebView ignores <input type="file"> unless WebChromeClient.onShowFileChooser is implemented.
 */
object QmraWebFileChooser {
    private const val TAG = "QmraWebFileChooser"

    private var webFileCallback: ValueCallback<Array<Uri>>? = null
    private var cameraOutputUri: Uri? = null
    private var launcher: ActivityResultLauncher<Intent>? = null
    private var bridgeMode = false

    fun init(activity: FragmentActivity) {
        if (launcher != null) {
            return
        }
        launcher = activity.registerForActivityResult(
            ActivityResultContracts.StartActivityForResult(),
        ) { result ->
            handleActivityResult(activity, result.resultCode, result.data)
        }
    }

    fun showFileChooser(
        activity: FragmentActivity,
        callback: ValueCallback<Array<Uri>>,
        @Suppress("UNUSED_PARAMETER") params: WebChromeClient.FileChooserParams?,
    ): Boolean {
        bridgeMode = false
        webFileCallback?.onReceiveValue(null)
        webFileCallback = callback
        launchChooser(activity)
        return true
    }

    fun openImagePickerForBridge(activity: FragmentActivity) {
        bridgeMode = true
        webFileCallback?.onReceiveValue(null)
        webFileCallback = null
        launchChooser(activity)
    }

    private fun launchChooser(activity: FragmentActivity) {
        ensureCameraPermissionThen(activity) {
            try {
                val chooser = buildChooserIntent(activity)
                launcher?.launch(chooser) ?: run {
                    failWebCallback()
                    notifyBridgeReject("unavailable")
                }
            } catch (e: Exception) {
                Log.e(TAG, "launchChooser failed: ${e.message}", e)
                failWebCallback()
                notifyBridgeReject("failed")
            }
        }
    }

    private fun buildChooserIntent(activity: Activity): Intent {
        val captureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).takeIf { intent ->
            intent.resolveActivity(activity.packageManager) != null
        }?.also { intent ->
            val photoFile = File(activity.cacheDir, "qmra_qr_${System.currentTimeMillis()}.jpg")
            cameraOutputUri = FileProvider.getUriForFile(
                activity,
                "${activity.packageName}.fileprovider",
                photoFile,
            )
            intent.putExtra(MediaStore.EXTRA_OUTPUT, cameraOutputUri)
        }
        if (captureIntent == null) {
            cameraOutputUri = null
        }

        val pickIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "image/*"
        }

        return Intent.createChooser(pickIntent, "اختر صورة").apply {
            if (captureIntent != null) {
                putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(captureIntent))
            }
        }
    }

    private fun handleActivityResult(activity: FragmentActivity, resultCode: Int, data: Intent?) {
        if (bridgeMode) {
            bridgeMode = false
            handleBridgeResult(activity, resultCode, data)
            return
        }

        val callback = webFileCallback
        webFileCallback = null
        if (callback == null) {
            cameraOutputUri = null
            return
        }

        if (resultCode != Activity.RESULT_OK) {
            callback.onReceiveValue(null)
            cameraOutputUri = null
            return
        }

        val uri = resolveResultUri(data)
        cameraOutputUri = null
        if (uri != null) {
            callback.onReceiveValue(arrayOf(uri))
        } else {
            callback.onReceiveValue(null)
        }
    }

    private fun handleBridgeResult(activity: FragmentActivity, resultCode: Int, data: Intent?) {
        if (resultCode != Activity.RESULT_OK) {
            notifyBridgeReject("cancelled")
            cameraOutputUri = null
            return
        }

        val uri = resolveResultUri(data)
        cameraOutputUri = null
        if (uri == null) {
            notifyBridgeReject("no_image")
            return
        }

        val dataUrl = uriToJpegDataUrl(activity, uri)
        if (dataUrl == null) {
            notifyBridgeReject("read_failed")
            return
        }
        notifyBridgeResolve(dataUrl)
    }

    private fun resolveResultUri(data: Intent?): Uri? {
        data?.data?.let { return it }
        return cameraOutputUri
    }

    private fun uriToJpegDataUrl(activity: Activity, uri: Uri): String? {
        return try {
            activity.contentResolver.openInputStream(uri)?.use { input ->
                val bitmap = BitmapFactory.decodeStream(input) ?: return null
                val scaled = scaleBitmap(bitmap, 1600)
                val baos = ByteArrayOutputStream()
                scaled.compress(Bitmap.CompressFormat.JPEG, 85, baos)
                if (scaled !== bitmap) {
                    scaled.recycle()
                }
                bitmap.recycle()
                val b64 = Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP)
                "data:image/jpeg;base64,$b64"
            }
        } catch (e: Exception) {
            Log.e(TAG, "uriToJpegDataUrl failed: ${e.message}", e)
            null
        }
    }

    private fun scaleBitmap(bitmap: Bitmap, maxDim: Int): Bitmap {
        val w = bitmap.width
        val h = bitmap.height
        if (w <= maxDim && h <= maxDim) {
            return bitmap
        }
        val scale = maxDim.toFloat() / maxOf(w, h)
        return Bitmap.createScaledBitmap(
            bitmap,
            (w * scale).toInt(),
            (h * scale).toInt(),
            true,
        )
    }

    private fun ensureCameraPermissionThen(activity: FragmentActivity, block: () -> Unit) {
        if (ContextCompat.checkSelfPermission(
                activity,
                android.Manifest.permission.CAMERA,
            ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        ) {
            block()
            return
        }
        androidx.core.app.ActivityCompat.requestPermissions(
            activity,
            arrayOf(android.Manifest.permission.CAMERA),
            QmraCameraBridge.REQ_CAMERA,
        )
        val handler = Handler(Looper.getMainLooper())
        handler.post(object : Runnable {
            var attempts = 0
            override fun run() {
                if (ContextCompat.checkSelfPermission(
                        activity,
                        android.Manifest.permission.CAMERA,
                    ) == android.content.pm.PackageManager.PERMISSION_GRANTED
                ) {
                    block()
                    return
                }
                attempts++
                if (attempts < 120) {
                    handler.postDelayed(this, 250)
                } else {
                    failWebCallback()
                    notifyBridgeReject("permission_denied")
                }
            }
        })
    }

    private fun failWebCallback() {
        webFileCallback?.onReceiveValue(null)
        webFileCallback = null
    }

    private fun notifyBridgeResolve(dataUrl: String) {
        val webView = MainActivity.instance?.getWebView() ?: return
        val safe = dataUrl
            .replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\n", "")
            .replace("\r", "")
        Handler(Looper.getMainLooper()).post {
            webView.evaluateJavascript(
                "if(window.__qmraQrPhotoResolve){window.__qmraQrPhotoResolve('$safe');}",
                null,
            )
        }
    }

    fun rejectBridge(reason: String) = notifyBridgeReject(reason)

    private fun notifyBridgeReject(reason: String) {
        val webView = MainActivity.instance?.getWebView() ?: return
        val safe = reason.replace("'", "")
        Handler(Looper.getMainLooper()).post {
            webView.evaluateJavascript(
                "if(window.__qmraQrPhotoReject){window.__qmraQrPhotoReject('$safe');}",
                null,
            )
        }
    }
}
