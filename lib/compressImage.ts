export const compressImage = (file: File, maxSizeMB = 1): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");

        // Scale down to max 1200px wide — enough for KYC clarity
        const MAX_WIDTH = 1200;
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

        // Iteratively reduce quality until under maxSizeMB
        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Compression failed"));

              if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.2) {
                quality = parseFloat((quality - 0.1).toFixed(1));
                tryCompress();
              } else {
                // Return as same filename but always jpeg for consistency
                resolve(
                  new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                    type: "image/jpeg",
                  }),
                );
              }
            },
            "image/jpeg",
            quality,
          );
        };

        tryCompress();
      };

      img.src = e.target!.result as string;
    };

    reader.readAsDataURL(file);
  });
};
