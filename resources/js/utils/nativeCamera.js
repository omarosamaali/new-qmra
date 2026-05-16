/**
 * Android WebView: camera / file picker bridges (post_compile patch).
 */
export const isNativeWebView = () =>
    typeof window !== "undefined" && !!window.AndroidPOST;

export const hasCameraBridge = () =>
    typeof window !== "undefined" &&
    window.CameraBridge &&
    typeof window.CameraBridge.hasCameraPermission === "function";

export const hasImagePickerBridge = () =>
    hasCameraBridge() && typeof window.CameraBridge.openImagePickerForQr === "function";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const ensureNativeCameraPermission = async () => {
    if (!hasCameraBridge()) {
        return !isNativeWebView();
    }
    if (window.CameraBridge.hasCameraPermission()) {
        return true;
    }
    window.CameraBridge.requestCameraPermission();
    for (let i = 0; i < 120; i++) {
        await sleep(250);
        if (window.CameraBridge.hasCameraPermission()) {
            return true;
        }
    }
    return false;
};

/**
 * Opens native camera/gallery chooser; resolves with a JPEG data URL.
 */
export const pickQrImageNative = () =>
    new Promise((resolve, reject) => {
        if (!hasImagePickerBridge()) {
            reject(new Error("no_bridge"));
            return;
        }

        const timeout = setTimeout(() => {
            window.__qmraQrPhotoResolve = null;
            window.__qmraQrPhotoReject = null;
            reject(new Error("timeout"));
        }, 120_000);

        window.__qmraQrPhotoResolve = (dataUrl) => {
            clearTimeout(timeout);
            window.__qmraQrPhotoResolve = null;
            window.__qmraQrPhotoReject = null;
            resolve(dataUrl);
        };

        window.__qmraQrPhotoReject = (reason) => {
            clearTimeout(timeout);
            window.__qmraQrPhotoResolve = null;
            window.__qmraQrPhotoReject = null;
            if (reason === "cancelled") {
                reject(new Error("cancelled"));
            } else if (reason === "permission_denied") {
                reject(new Error("permission_denied"));
            } else {
                reject(new Error(reason || "failed"));
            }
        };

        try {
            window.CameraBridge.openImagePickerForQr();
        } catch (e) {
            clearTimeout(timeout);
            window.__qmraQrPhotoResolve = null;
            window.__qmraQrPhotoReject = null;
            reject(e);
        }
    });

export const openNativeAppSettings = () => {
    if (hasCameraBridge() && typeof window.CameraBridge.openAppSettings === "function") {
        window.CameraBridge.openAppSettings();
    }
};
