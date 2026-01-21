<?php
declare(strict_types=1);

/**
 * UploadController
 * Maneja la subida de archivos (imágenes de productos, etc.)
 */
class UploadController
{
    // Directorio base para uploads (relativo a public/)
    private const UPLOAD_BASE_DIR = __DIR__ . '/../../public/uploads';
    private const PRODUCTS_DIR = self::UPLOAD_BASE_DIR . '/products';

    // Configuración de archivos permitidos
    private const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    // Resolución estándar para imágenes de productos (cuadradas)
    private const TARGET_WIDTH = 400;
    private const TARGET_HEIGHT = 400;

    /**
     * POST /api/admin/upload/product-image
     * Sube una imagen de producto, la redimensiona a 400x400 y retorna la URL pública
     */
    public function uploadProductImage(): void
    {
        // Validar que se envió un archivo
        if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
            ApiResponse::validationError('No se envió ninguna imagen.', 'image');
        }

        $file = $_FILES['image'];

        // Validar errores de subida
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE => 'El archivo excede el tamaño máximo permitido por el servidor.',
                UPLOAD_ERR_FORM_SIZE => 'El archivo excede el tamaño máximo permitido.',
                UPLOAD_ERR_PARTIAL => 'El archivo se subió parcialmente.',
                UPLOAD_ERR_NO_TMP_DIR => 'Falta la carpeta temporal.',
                UPLOAD_ERR_CANT_WRITE => 'Error al escribir el archivo en disco.',
                UPLOAD_ERR_EXTENSION => 'Subida detenida por extensión PHP.',
            ];

            $message = $errorMessages[$file['error']] ?? 'Error desconocido al subir el archivo.';
            ApiResponse::serverError($message, ['error_code' => $file['error']]);
        }

        // Validar tamaño
        if ($file['size'] > self::MAX_FILE_SIZE) {
            ApiResponse::validationError(
                'La imagen es demasiado grande. Tamaño máximo: 5MB.',
                'image',
                ['max_size_mb' => 5, 'uploaded_size_mb' => round($file['size'] / 1024 / 1024, 2)]
            );
        }

        // Validar tipo MIME (estilo OO evita finfo_close deprecado)
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        if (!in_array($mimeType, self::ALLOWED_TYPES, true)) {
            ApiResponse::validationError(
                'Tipo de archivo no permitido. Solo se aceptan imágenes JPEG, PNG y WebP.',
                'image',
                ['allowed_types' => ['jpeg', 'png', 'webp'], 'uploaded_type' => $mimeType]
            );
        }

        // Crear directorio si no existe
        if (!is_dir(self::PRODUCTS_DIR)) {
            if (!mkdir(self::PRODUCTS_DIR, 0755, true)) {
                ApiResponse::serverError('No se pudo crear el directorio de uploads.');
            }
        }

        // Generar nombre único para el archivo (siempre guardamos como JPG para optimizar)
        $filename = $this->generateUniqueFilename('jpg');
        $targetPath = self::PRODUCTS_DIR . '/' . $filename;

        // Procesar y redimensionar la imagen
        $processResult = $this->processAndResizeImage($file['tmp_name'], $mimeType, $targetPath);
        
        if (!$processResult['success']) {
            ApiResponse::serverError($processResult['error']);
        }

        // Generar URL pública
        $publicUrl = rtrim(BASE_URL, '/') . '/uploads/products/' . $filename;

        ApiResponse::success([
            'filename' => $filename,
            'url' => $publicUrl,
            'size' => filesize($targetPath),
            'type' => 'image/jpeg',
            'width' => self::TARGET_WIDTH,
            'height' => self::TARGET_HEIGHT,
            'original_width' => $processResult['original_width'],
            'original_height' => $processResult['original_height']
        ], 201);
    }

    /**
     * Procesa y redimensiona la imagen a las dimensiones estándar
     * 
     * @param string $sourcePath Ruta del archivo temporal
     * @param string $mimeType Tipo MIME de la imagen
     * @param string $targetPath Ruta destino
     * @return array ['success' => bool, 'error' => string|null, 'original_width' => int, 'original_height' => int]
     */
    private function processAndResizeImage(string $sourcePath, string $mimeType, string $targetPath): array
    {
        // Verificar que GD está disponible
        if (!extension_loaded('gd')) {
            // Si no hay GD, guardar sin procesar
            if (move_uploaded_file($sourcePath, $targetPath)) {
                $size = getimagesize($targetPath);
                return [
                    'success' => true,
                    'error' => null,
                    'original_width' => $size[0] ?? 0,
                    'original_height' => $size[1] ?? 0
                ];
            }
            return ['success' => false, 'error' => 'Error al guardar la imagen.', 'original_width' => 0, 'original_height' => 0];
        }

        // Obtener dimensiones originales
        $imageInfo = getimagesize($sourcePath);
        if ($imageInfo === false) {
            return ['success' => false, 'error' => 'No se pudo leer la imagen.', 'original_width' => 0, 'original_height' => 0];
        }
        
        $originalWidth = $imageInfo[0];
        $originalHeight = $imageInfo[1];

        // Crear imagen desde el archivo original
        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                $sourceImage = @imagecreatefromjpeg($sourcePath);
                break;
            case 'image/png':
                $sourceImage = @imagecreatefrompng($sourcePath);
                break;
            case 'image/webp':
                $sourceImage = @imagecreatefromwebp($sourcePath);
                break;
            default:
                return ['success' => false, 'error' => 'Tipo de imagen no soportado.', 'original_width' => $originalWidth, 'original_height' => $originalHeight];
        }

        if ($sourceImage === false) {
            return ['success' => false, 'error' => 'Error al procesar la imagen.', 'original_width' => $originalWidth, 'original_height' => $originalHeight];
        }

        // Crear imagen de destino con fondo blanco (para transparencias)
        $targetImage = imagecreatetruecolor(self::TARGET_WIDTH, self::TARGET_HEIGHT);
        $white = imagecolorallocate($targetImage, 255, 255, 255);
        imagefill($targetImage, 0, 0, $white);

        // Calcular dimensiones para mantener aspect ratio y centrar
        $srcRatio = $originalWidth / $originalHeight;
        $dstRatio = self::TARGET_WIDTH / self::TARGET_HEIGHT;

        if ($srcRatio > $dstRatio) {
            // Imagen más ancha - ajustar por ancho
            $newWidth = self::TARGET_WIDTH;
            $newHeight = (int) round(self::TARGET_WIDTH / $srcRatio);
            $dstX = 0;
            $dstY = (int) round((self::TARGET_HEIGHT - $newHeight) / 2);
        } else {
            // Imagen más alta - ajustar por alto
            $newHeight = self::TARGET_HEIGHT;
            $newWidth = (int) round(self::TARGET_HEIGHT * $srcRatio);
            $dstX = (int) round((self::TARGET_WIDTH - $newWidth) / 2);
            $dstY = 0;
        }

        // Redimensionar y copiar
        imagecopyresampled(
            $targetImage,
            $sourceImage,
            $dstX, $dstY,           // Destino X, Y
            0, 0,                    // Origen X, Y
            $newWidth, $newHeight,   // Nuevo tamaño
            $originalWidth, $originalHeight // Tamaño original
        );

        // Guardar como JPEG con calidad 85 (buen balance calidad/tamaño)
        $saved = imagejpeg($targetImage, $targetPath, 85);

        // Liberar memoria
        imagedestroy($sourceImage);
        imagedestroy($targetImage);

        if (!$saved) {
            return ['success' => false, 'error' => 'Error al guardar la imagen procesada.', 'original_width' => $originalWidth, 'original_height' => $originalHeight];
        }

        return [
            'success' => true,
            'error' => null,
            'original_width' => $originalWidth,
            'original_height' => $originalHeight
        ];
    }

    /**
     * Genera un nombre de archivo único
     */
    private function generateUniqueFilename(string $extension): string
    {
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        return "product_{$timestamp}_{$random}.{$extension}";
    }
}
?>
