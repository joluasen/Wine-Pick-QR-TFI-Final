<?php
// app/Utils/Router.php
declare(strict_types=1);

/**
 * Enrutador de Solicitudes HTTP
 * 
 * Gestiona el mapeo de URLs a controladores y acciones específicas.
 * Interpreta la solicitud HTTP entrante, extrae parámetros dinámicos de la URL,
 * y delega la ejecución al controlador correspondiente.
 * 
 * Rutas soportadas:
 * - GET /api/public/productos/{codigo}  - Obtener producto por código QR
 * - GET /api/public/productos?search=.. - Buscar productos
 * - POST /api/admin/productos           - Crear nuevo producto
 */
class Router
{
    private string $requestUri;
    private string $requestMethod;
    private array $routes = [];

    public function __construct()
    {
        $fullUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
        
        // Extraer la ruta relativa al proyecto desde BASE_URL
        $projectPath = parse_url(BASE_URL, PHP_URL_PATH) ?: '/proyectos/Wine-Pick-QR-TFI';
        if (strpos($fullUri, $projectPath) === 0) {
            $this->requestUri = substr($fullUri, strlen($projectPath));
        } else {
            $this->requestUri = $fullUri;
        }
        
        if (strpos($this->requestUri, '/') !== 0) {
            $this->requestUri = '/' . $this->requestUri;
        }
        
        $this->requestMethod = $_SERVER['REQUEST_METHOD'];

        $this->registerRoutes();
    }

    /**
     * Registrar las rutas de la API.
     */
    private function registerRoutes(): void
    {
        // GET /api/public/productos/{codigo}
        $this->get('/api/public/productos/{codigo}', 'ProductController@getByCode');

        // GET /api/public/productos?search=... (búsqueda simple y avanzada)
        $this->get('/api/public/productos', 'ProductController@search');

        // GET /api/public/promociones - Listar productos con promociones vigentes
        $this->get('/api/public/promociones', 'ProductController@listActivePromotions');

        // GET /api/public/mas-buscados - Listar productos más buscados
        $this->get('/api/public/mas-buscados', 'ProductController@listMostSearched');

        // Auth
        $this->post('/api/admin/login', 'AuthController@login');
        $this->post('/api/admin/logout', 'AuthController@logout');
        $this->get('/api/admin/me', 'AuthController@me');

        // POST /api/admin/productos (protegido)
        $this->post('/api/admin/productos', 'ProductController@create');

        // PUT /api/admin/productos/{id} (protegido, RESTful)
        $this->put('/api/admin/productos/{id}', 'ProductController@update');

        // POST /api/admin/productos/actualizar (protegido, legacy)
        $this->post('/api/admin/productos/actualizar', 'ProductController@update');

        // GET /api/admin/productos?limit=...&offset=... (protegido, listar con paginación)
        $this->get('/api/admin/productos', 'ProductController@listAllAdmin');

        // POST /api/admin/promociones (protegido)
        $this->post('/api/admin/promociones', 'PromotionController@create');

        // GET /api/admin/promociones?product_id=... o ?limit=...&offset=... (protegido)
        $this->get('/api/admin/promociones', 'PromotionController@listPromotions');

        // POST /api/admin/upload/product-image (protegido)
        $this->post('/api/admin/upload/product-image', 'UploadController@uploadProductImage');

        // GET /api/admin/metrics?days=... (protegido)
        $this->get('/api/admin/metrics', 'MetricController@getMetrics');
    }

    /**
     * Registrar ruta GET.
     * 
     * @param string $pattern
     * @param string $handler (Formato: "ControllerName@methodName")
     */
    private function get(string $pattern, string $handler): void
    {
        $this->routes['GET'][$pattern] = $handler;
    }

    /**
     * Registrar ruta POST.
     *
     * @param string $pattern
     * @param string $handler
     */
    private function post(string $pattern, string $handler): void
    {
        $this->routes['POST'][$pattern] = $handler;
    }

    /**
     * Registrar ruta PUT.
     *
     * @param string $pattern
     * @param string $handler
     */
    private function put(string $pattern, string $handler): void
    {
        $this->routes['PUT'][$pattern] = $handler;
    }

    /**
     * Registrar ruta DELETE.
     *
     * @param string $pattern
     * @param string $handler
     */
    private function delete(string $pattern, string $handler): void
    {
        $this->routes['DELETE'][$pattern] = $handler;
    }

    /**
     * Procesar la solicitud y ejecutar la acción correspondiente.
     * 
     * Busca la ruta que coincida con la solicitud actual y ejecuta el controlador
     * asociado. Si no encuentra coincidencia, devuelve un error 404.
     * 
     * @return void
     */
    public function dispatch(): void
    {
        $method = $this->requestMethod;
        $uri = $this->requestUri;

        wpq_debug_log("Solicitud: {$method} {$uri}");

        if (strpos($uri, '/api/') === false) {
            http_response_code(404);
            echo 'Ruta no encontrada.';
            return;
        }

        if (isset($this->routes[$method])) {
            foreach ($this->routes[$method] as $pattern => $handler) {
                $params = $this->matchRoute($pattern, $uri, $method);

                if ($params !== null) {
                    $this->executeHandler($handler, $params);
                    return;
                }
            }
        }

        // No se encontró ruta
        JsonResponse::error(
            'NOT_FOUND',
            'Ruta no encontrada: ' . $method . ' ' . $uri,
            404
        );
    }

    /**
     * Intentar hacer match entre un patrón de ruta y la URI.
     * 
     * @param string $pattern (e.g., "/api/public/productos/{codigo}")
     * @param string $uri (e.g., "/api/public/productos/QR-12345")
     * @param string $method
     * 
     * @return array|null Array con parámetros capturados, o null si no coincide.
     */
    private function matchRoute(string $pattern, string $uri, string $method): ?array
    {
        // Convertir patrón a expresión regular
        $regex = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern);
        $regex = '@^' . $regex . '$@';

        if (preg_match($regex, $uri, $matches)) {
            // Filtrar solo los grupos nombrados (parámetros)
            $params = [];
            foreach ($matches as $key => $value) {
                if (is_string($key)) {
                    $params[$key] = $value;
                }
            }

            return $params;
        }

        return null;
    }

    /**
     * Ejecutar el handler (acción del controlador).
     * 
     * @param string $handler (Formato: "ControllerName@methodName")
     * @param array $params Parámetros capturados de la ruta.
     */
    private function executeHandler(string $handler, array $params): void
    {
        [$controllerName, $methodName] = explode('@', $handler);

        $controllerClass = $controllerName;

        // Verificar que la clase existe
        if (!class_exists($controllerClass)) {
            JsonResponse::error(
                'INTERNAL_ERROR',
                "Controlador '{$controllerClass}' no encontrado.",
                500
            );
        }

        // Inyectar dependencias si es PromotionController
        if ($controllerClass === 'PromotionController') {
            $promotionModel = new Promotion(Database::getInstance());
            $productModel = new Product(Database::getInstance());
            $controller = new $controllerClass($promotionModel, $productModel);
        } else {
            // Controladores sin inyección de dependencias
            $controller = new $controllerClass();
        }

        if (!method_exists($controller, $methodName)) {
            JsonResponse::error(
                'INTERNAL_ERROR',
                "Método '{$methodName}' no encontrado en '{$controllerClass}'.",
                500
            );
        }

        // Ejecutar el método con los parámetros capturados
        if (empty($params)) {
            // Si no hay parámetros, ejecutar sin argumentos
            $controller->$methodName();
        } else {
            // Si hay parámetros, pasarlos como argumentos
            $controller->$methodName(...array_values($params));
        }
    }
}
?>
