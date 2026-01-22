<?php
// app/Utils/Auth.php
declare(strict_types=1);

/**
 * Servicio de Autenticación basado en JWT + Cookie HttpOnly
 *
 * Proporciona métodos para emitir, validar y eliminar tokens JWT almacenados en cookies seguras.
 * Permite la autenticación de usuarios administradores en la API.
 */
class Auth
{
    /**
     * Devuelve el nombre de la cookie de autenticación.
     * @return string Nombre de la cookie.
     */
    private static function cookieName(): string
    {
        return defined('AUTH_COOKIE_NAME') ? AUTH_COOKIE_NAME : 'wpq_auth';
    }

    /**
     * Devuelve el secreto para firmar/verificar JWT.
     * @return string Secreto JWT.
     */
    private static function secret(): string
    {
        return defined('JWT_SECRET') ? JWT_SECRET : 'dev-secret-change-me';
    }

    /**
     * Determina si la cookie debe marcarse como Secure.
     * @return bool True si debe ser Secure.
     */
    private static function isSecureCookie(): bool
    {
        // Usar HTTPS real o si BASE_URL es https
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (stripos(BASE_URL, 'https://') === 0);
        return $isHttps;
    }

    /**
     * Emite un JWT para el usuario y lo setea en cookie HttpOnly.
     *
     * @param array $user Datos del usuario (debe incluir id y username).
     * @param int $ttl Tiempo de vida del token en segundos (default: 1800).
     * @return string Token JWT generado.
     */
    public static function issueToken(array $user, int $ttl = 1800): string
    {
        $payload = [
            'sub' => (int)($user['id'] ?? 0),
            'username' => (string)($user['username'] ?? ''),
            'iat' => time(),
            'exp' => time() + $ttl,
        ];
        $token = Jwt::encode($payload, self::secret(), $ttl);
        self::setAuthCookie($token, $ttl);
        return $token;
    }

    /**
     * Setea la cookie de autenticación con el token JWT.
     *
     * @param string $token Token JWT.
     * @param int $ttl Tiempo de vida en segundos.
     * @return void
     */
    public static function setAuthCookie(string $token, int $ttl): void
    {
        $params = [
            'expires' => time() + $ttl,
            'path' => parse_url(BASE_URL, PHP_URL_PATH) ?: '/',
            'domain' => '', // origin-only
            'secure' => self::isSecureCookie(),
            'httponly' => true,
            'samesite' => 'Strict',
        ];
        setcookie(self::cookieName(), $token, $params);
    }

    /**
     * Borra la cookie de autenticación (logout).
     *
     * @return void
     */
    public static function clearAuthCookie(): void
    {
        $params = [
            'expires' => time() - 3600,
            'path' => parse_url(BASE_URL, PHP_URL_PATH) ?: '/',
            'domain' => '',
            'secure' => self::isSecureCookie(),
            'httponly' => true,
            'samesite' => 'Strict',
        ];
        setcookie(self::cookieName(), '', $params);
    }

    /**
     * Obtiene y valida el JWT desde la cookie; devuelve claims o lanza 401.
     *
     * @return array Claims del usuario autenticado.
     */
    public static function assertAuthenticated(): array
    {
        $token = $_COOKIE[self::cookieName()] ?? '';
        if ($token === '') {
            ApiResponse::unauthorized('Autenticación requerida.');
        }
        try {
            $claims = Jwt::decode($token, self::secret());
            // Adjuntar contexto para controladores
            $_SERVER['WPQ_USER'] = $claims;
            return $claims;
        } catch (\Exception $e) {
            ApiResponse::unauthorized('Token inválido o expirado.');
        }
        return [];
    }

    /**
     * Devuelve claims si el usuario está autenticado, o null si no.
     *
     * @return array|null Claims del usuario o null si no está autenticado.
     */
    public static function getUser(): ?array
    {
        $token = $_COOKIE[self::cookieName()] ?? '';
        if ($token === '') return null;
        try {
            return Jwt::decode($token, self::secret());
        } catch (\Exception $e) {
            return null;
        }
    }
}
?>
