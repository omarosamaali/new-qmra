import jsQR from "jsqr";

/**
 * Decode QR from a photo file (works in Android WebView without getUserMedia).
 */
export function decodeQrFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const maxDim = 1600;
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    const scale = maxDim / Math.max(width, height);
                    width = Math.floor(width * scale);
                    height = Math.floor(height * scale);
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const imageData = ctx.getImageData(0, 0, width, height);
                const result = jsQR(imageData.data, imageData.width, imageData.height);
                if (result?.data) {
                    resolve(result.data);
                } else {
                    reject(new Error("no_qr"));
                }
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => reject(new Error("load_failed"));
        img.src = dataUrl;
    });
}

export function decodeQrFromImageFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("no_file"));
            return;
        }
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const maxDim = 1600;
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    const scale = maxDim / Math.max(width, height);
                    width = Math.floor(width * scale);
                    height = Math.floor(height * scale);
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const imageData = ctx.getImageData(0, 0, width, height);
                const result = jsQR(imageData.data, imageData.width, imageData.height);
                if (result?.data) {
                    resolve(result.data);
                } else {
                    reject(new Error("no_qr"));
                }
            } catch (e) {
                reject(e);
            } finally {
                URL.revokeObjectURL(url);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("load_failed"));
        };
        img.src = url;
    });
}
