<?php
declare(strict_types=1);

/**
 * UploadController
 * Maneja la subida de archivos (imágenes de productos, etc.)
 */
class UploadController
{
    // Directorio base para guardar archivos subidos (relativo a public/)
    private const UPLOAD_BASE_DIR = __DIR__ . '/../../public/uploads';
    private const PRODUCTS_DIR = self::UPLOAD_BASE_DIR . '/products';

    // Tipos de archivos permitidos y tamaño máximo
    private const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    // Resolución estándar a la que se redimensionan las imágenes de productos
    private const TARGET_WIDTH = 400;
    private const TARGET_HEIGHT = 400;

    /**
     * Maneja la subida de una imagen de producto.
     * - Valida el archivo recibido.
     * - Redimensiona la imagen a 400x400 px.
     * - Guarda la imagen en el servidor.
     * - Devuelve la URL pública y metadatos de la imagen.
     * Endpoint: POST /api/admin/upload/product-image
     */
    public function uploadProductImage(): void
    {
        // Validar que se haya enviado un archivo en la petición
        if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
            ApiResponse::validationError('No se envió ninguna imagen.', 'image');
        }

        $file = $_FILES['image'];

        // Validar si hubo errores durante la subida del archivo
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

        // Validar que el archivo no exceda el tamaño máximo permitido
        if ($file['size'] > self::MAX_FILE_SIZE) {
            ApiResponse::validationError(
                'La imagen es demasiado grande. Tamaño máximo: 5MB.',
                'image',
                ['max_size_mb' => 5, 'uploaded_size_mb' => round($file['size'] / 1024 / 1024, 2)]
            );
        }

        // Validar el tipo MIME del archivo (solo imágenes permitidas)
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        if (!in_array($mimeType, self::ALLOWED_TYPES, true)) {
            ApiResponse::validationError(
                'Tipo de archivo no permitido. Solo se aceptan imágenes JPEG, PNG y WebP.',
                'image',
                ['allowed_types' => ['jpeg', 'png', 'webp'], 'uploaded_type' => $mimeType]
            );
        }

        // Crear el directorio de destino si no existe
        if (!is_dir(self::PRODUCTS_DIR)) {
            if (!mkdir(self::PRODUCTS_DIR, 0755, true)) {
                ApiResponse::serverError('No se pudo crear el directorio de uploads.');
            }
        }

        // Generar un nombre único para el archivo (siempre se guarda como JPG)
        $filename = $this->generateUniqueFilename('jpg');
        $targetPath = self::PRODUCTS_DIR . '/' . $filename;

        // Procesar y redimensionar la imagen a las dimensiones estándar
        $processResult = $this->processAndResizeImage($file['tmp_name'], $mimeType, $targetPath);
        
        if (!$processResult['success']) {
            ApiResponse::serverError($processResult['error']);
        }

        // Generar la URL pública para acceder a la imagen subida
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
     * Procesa y redimensiona la imagen recibida a las dimensiones estándar.
     * Si la extensión GD no está disponible, guarda la imagen tal cual.
     *
     * @param string $sourcePath Ruta del archivo temporal subido
     * @param string $mimeType Tipo MIME de la imagen
     * @param string $targetPath Ruta destino donde se guardará la imagen
     * @return array Resultado del procesamiento, incluyendo éxito, error y dimensiones originales
     */
    private function processAndResizeImage(string $sourcePath, string $mimeType, string $targetPath): array
    {
        // Verificar si la extensión GD está disponible para procesar imágenes
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

        // Obtener las dimensiones originales de la imagen
        $imageInfo = getimagesize($sourcePath);
        if ($imageInfo === false) {
            return ['success' => false, 'error' => 'No se pudo leer la imagen.', 'original_width' => 0, 'original_height' => 0];
        }
        
        $originalWidth = $imageInfo[0];
        $originalHeight = $imageInfo[1];

        // Crear un recurso de imagen desde el archivo original según el tipo MIME
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

        // Crear la imagen de destino (400x400) con fondo blanco para soportar transparencias
        $targetImage = imagecreatetruecolor(self::TARGET_WIDTH, self::TARGET_HEIGHT);
        $white = imagecolorallocate($targetImage, 255, 255, 255);
        imagefill($targetImage, 0, 0, $white);

        // Calcular dimensiones para mantener el aspecto original y centrar la imagen
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

        // Redimensionar y copiar la imagen original a la imagen destino
        imagecopyresampled(
            $targetImage,
            $sourceImage,
            $dstX, $dstY,           // Destino X, Y
            0, 0,                    // Origen X, Y
            $newWidth, $newHeight,   // Nuevo tamaño
            $originalWidth, $originalHeight // Tamaño original
        );

        // Guardar la imagen destino como JPEG con calidad 85
        $saved = imagejpeg($targetImage, $targetPath, 85);

        // Liberar memoria de los recursos de imagen
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
     * Genera un nombre de archivo único para la imagen subida.
     * @param string $extension Extensión del archivo (ej: jpg)
     * @return string Nombre de archivo generado
     */
    private function generateUniqueFilename(string $extension): string
    {
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        return "product_{$timestamp}_{$random}.{$extension}";
    }

    /**
     * Elimina una imagen de producto del servidor.
     * @param string $imageUrl URL completa de la imagen a eliminar
     * @return bool True si se eliminó correctamente o no existía, false en caso de error
     */
    public static function deleteProductImage(string $imageUrl): bool
    {
        // Validar que la URL pertenece al servidor
        if (strpos($imageUrl, BASE_URL) !== 0) {
            return false; // No es una imagen del servidor
        }

        // Extraer la ruta relativa de la URL
        $relativePath = str_replace(rtrim(BASE_URL, '/') . '/', '', $imageUrl);
        
        // Construir la ruta absoluta del archivo
        $filePath = __DIR__ . '/../../public/' . $relativePath;
        
        // Verificar que el archivo existe
        if (!file_exists($filePath)) {
            return true; // No existe, consideramos que está "eliminado"
        }

        // Verificar que está dentro del directorio permitido (seguridad)
        $realPath = realpath($filePath);
        $allowedPath = realpath(self::PRODUCTS_DIR);
        
        if (!$realPath || !$allowedPath || strpos($realPath, $allowedPath) !== 0) {
            return false; // Intento de acceso fuera del directorio permitido
        }

        // Eliminar el archivo
        return @unlink($filePath);
    }
}
?>
