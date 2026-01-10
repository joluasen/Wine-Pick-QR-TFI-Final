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

    /**
     * POST /api/admin/upload/product-image
     * Sube una imagen de producto y retorna la URL pública
     */
    public function uploadProductImage(): void
    {
        // Proteger endpoint: requiere sesión de admin
        if (empty($_SESSION['admin_user_id'])) {
            ApiResponse::unauthorized('No autenticado. Inicia sesión para continuar.');
        }

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

        // Validar tipo MIME
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

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

        // Generar nombre único para el archivo
        $extension = $this->getExtensionFromMime($mimeType);
        $filename = $this->generateUniqueFilename($extension);
        $targetPath = self::PRODUCTS_DIR . '/' . $filename;

        // Mover archivo
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            ApiResponse::serverError('Error al guardar la imagen.');
        }

        // Generar URL pública
        $publicUrl = BASE_URL . 'uploads/products/' . $filename;

        ApiResponse::success([
            'filename' => $filename,
            'url' => $publicUrl,
            'size' => $file['size'],
            'type' => $mimeType
        ], 201);
    }

    /**
     * Obtiene la extensión de archivo desde el tipo MIME
     */
    private function getExtensionFromMime(string $mime): string
    {
        $map = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp'
        ];

        return $map[$mime] ?? 'jpg';
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
