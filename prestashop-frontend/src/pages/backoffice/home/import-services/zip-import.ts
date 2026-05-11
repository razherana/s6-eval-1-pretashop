import JSZip from "jszip";
import { fetchFromPrestashopApi } from "@/utils/url";
import { fetchProducts } from "../services";
import type { ProductReadXML } from "../types";
import type { ImportSummary, ImportedRow } from "../services";

export interface ImageUploadResult {
  productId: number;
  productReference: string;
  imageFile: string;
  success: boolean;
  error?: string;
  imageId?: number;
}

async function uploadProductImage(
  productId: number,
  imageFile: File,
): Promise<{ success: boolean; imageId?: number; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await fetchFromPrestashopApi<any>(
      `/images/products/${productId}`,
      {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for multipart
        headers: {},
      },
    );

    console.log(`Image upload response for product ${productId}:`, response);
    return {
      success: true,
      imageId: response.image?.id || response.id,
    };
  } catch (error) {
    console.error(`Error uploading image for product ${productId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Just in case we need to parse the name one day.
 *
 * @param filename
 * @returns
 */
function getProductReferenceFromFilename(filename: string): string {
  // Remove extension
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex <= 0) return filename; // No extension or hidden file

  return filename.substring(0, lastDotIndex);
}

export async function importImagesFromZip(
  zipFile: File,
  onProgress?: (progress: number) => void,
): Promise<{
  summary: ImportSummary;
  rows: ImportedRow[];
  imageResults: ImageUploadResult[];
}> {
  const imageResults: ImageUploadResult[] = [];

  try {
    // Load the ZIP file
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);

    // Get all image files
    const imageFiles: { name: string; file: File }[] = [];

    // Define supported image extensions as a Set for O(1) lookup
    const imageExtensions = new Set([
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".svg",
      ".tiff",
      ".ico",
    ]);

    // Collect all image files from ZIP
    const entries = Object.entries(zipContent.files);

    for (const [path, zipEntry] of entries) {
      // Skip directories
      if (zipEntry.dir) continue;

      // Get just the filename without folder path
      const filename = path.split("/").pop() || path;

      // Skip files that start with a dot (hidden files)
      if (filename.startsWith(".")) continue;

      // Skip macOS metadata folders and files
      if (path.startsWith("__MACOSX") || filename.startsWith("._")) continue;

      // Extract extension properly
      const lastDotIndex = filename.lastIndexOf(".");

      // Skip files without a valid extension (no dot, or dot at start like .htaccess)
      if (lastDotIndex <= 0) continue;

      const ext = filename.substring(lastDotIndex).toLowerCase();

      // Check if it's a supported image extension
      if (!imageExtensions.has(ext)) continue;

      // Read the file data
      const blob = await zipEntry.async("blob");
      const file = new File([blob], filename, {
        type: `image/${ext.slice(1)}`,
      });

      imageFiles.push({ name: filename, file });
    }

    console.log(`Found ${imageFiles.length} image files in ZIP`);

    if (imageFiles.length === 0) {
      return {
        summary: {
          step: "Images Archive",
          fileName: zipFile.name,
          totalRows: 0,
          successCount: 0,
          failedCount: 0,
          warnings: 0,
        },
        rows: [],
        imageResults: [],
      };
    }

    // Fetch all products to map references to IDs
    const products = await fetchProducts(1000, 0);
    const productMap = new Map<string, ProductReadXML>();

    products.forEach((product) => {
      if (product.reference) {
        productMap.set(product.reference, product);
      }
    });

    console.log(
      `Loaded ${products.length} products, ${productMap.size} with references`,
    );

    // Process each image
    let successCount = 0;
    let failedCount = 0;
    const totalImages = imageFiles.length;

    for (let i = 0; i < totalImages; i++) {
      const { name, file } = imageFiles[i];
      const reference = getProductReferenceFromFilename(name);

      // Find matching product
      const product = productMap.get(reference);

      if (!product) {
        console.warn(
          `No product found for reference: ${reference} (file: ${name})`,
        );
        imageResults.push({
          productId: 0,
          productReference: reference,
          imageFile: name,
          success: false,
          error: `No product found with reference "${reference}"`,
        });
        failedCount++;

        // Update progress
        onProgress?.(Math.round(((i + 1) / totalImages) * 100));
        continue;
      }

      // Upload image to product
      const uploadResult = await uploadProductImage(product.id, file);

      imageResults.push({
        productId: product.id,
        productReference: reference,
        imageFile: name,
        success: uploadResult.success,
        error: uploadResult.error,
        imageId: uploadResult.imageId,
      });

      if (uploadResult.success) {
        successCount++;
        console.log(
          `Uploaded ${name} to product ${product.id} (ref: ${reference})`,
        );
      } else {
        failedCount++;
        console.error(`Failed to upload ${name} to product ${product.id}`);
      }

      // Update progress
      onProgress?.(Math.round(((i + 1) / totalImages) * 100));
    }

    // Create summary and rows in the expected format
    const rows: ImportedRow[] = imageResults.map((result, index) => ({
      index: index + 1,
      data: {
        file: result.imageFile,
        reference: result.productReference,
        productId: result.productId.toString(),
        imageId: result.imageId?.toString() || "",
      },
      success: result.success,
      error: result.error,
    }));

    const summary: ImportSummary = {
      step: "Images", // Changed from "Images Archive" to match
      fileName: zipFile.name,
      totalRows: totalImages,
      successCount,
      failedCount,
      warnings: 0,
    };

    return { summary, rows, imageResults };
  } catch (error) {
    console.error("Error processing ZIP file:", error);
    throw error;
  }
}
