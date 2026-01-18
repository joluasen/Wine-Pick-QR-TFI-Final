<?php
// app/Utils/Auth.php
declare(strict_types=1);

/**
 * Servicio de Autenticación basado en JWT + Cookie HttpOnly
 */
class Auth
{
    /** Nombre de la cookie con el token */
    private static function cookieName(): string
    {
        return defined('AUTH_COOKIE_NAME') ? AUTH_COOKIE_NAME : 'wpq_auth';
    }

    /** Secret para firmar JWT */
    private static function secret(): string
    {
        return defined('JWT_SECRET') ? JWT_SECRET : 'dev-secret-change-me';
    }

    /** Determina si debe marcar Secure en la cookie */
    private static function isSecureCookie(): bool
    {
        // Usar HTTPS real o si BASE_URL es https
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (stripos(BASE_URL, 'https://') === 0);
        return $isHttps;
    }

    /** Emite un JWT para el usuario y lo setea en cookie HttpOnly */
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

    /** Setea la cookie de autenticación */
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

    /** Borra la cookie de autenticación (logout) */
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

    /** Obtiene y valida el JWT desde la cookie; devuelve claims o lanza 401 */
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

    /** Devuelve claims si el usuario está autenticado, o null si no */
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
