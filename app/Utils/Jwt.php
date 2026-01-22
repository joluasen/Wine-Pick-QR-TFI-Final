<?php
// app/Utils/Jwt.php
declare(strict_types=1);

/**
 * Clase Jwt
 *
 * Utilidad JWT HS256 (sin dependencias externas).
 * Permite codificar y decodificar tokens JWT firmados con HMAC SHA-256.
 * Implementa base64 URL safe y soporta claims estándar como iat, exp, nbf.
 */
class Jwt
{
    /**
     * Genera un token JWT firmado HS256
     *
     * @param array $payload Datos (se añaden iat y exp si no están)
     * @param string $secret Clave secreta
     * @param int $ttlSegundos Tiempo de vida (segundos)
     * @return string Token JWT
     */
    public static function encode(array $payload, string $secret, int $ttlSegundos = 1800): string
    {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];

        $now = time();
        if (!isset($payload['iat'])) $payload['iat'] = $now;
        if (!isset($payload['exp'])) $payload['exp'] = $now + $ttlSegundos;

        $segments = [
            self::b64url(json_encode($header)),
            self::b64url(json_encode($payload))
        ];
        $signingInput = implode('.', $segments);
        $signature = hash_hmac('sha256', $signingInput, $secret, true);
        $segments[] = self::b64url($signature);
        return implode('.', $segments);
    }

    /**
     * Decodifica y valida un token JWT HS256
     *
     * @param string $token Token JWT
     * @param string $secret Clave secreta
     * @return array Payload validado
     * @throws \Exception Si el token es inválido o expirado
     */
    public static function decode(string $token, string $secret): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new \Exception('Token mal formado');
        }

        [$h, $p, $s] = $parts;
        $headerJson = self::b64urlDecode($h);
        $payloadJson = self::b64urlDecode($p);
        $signature = self::b64urlDecode($s);

        $header = json_decode($headerJson, true);
        $payload = json_decode($payloadJson, true);
        if (!$header || !$payload) {
            throw new \Exception('Token inválido');
        }
        if (($header['alg'] ?? '') !== 'HS256') {
            throw new \Exception('Algoritmo no soportado');
        }

        $expected = hash_hmac('sha256', $h . '.' . $p, $secret, true);
        if (!hash_equals($expected, $signature)) {
            throw new \Exception('Firma inválida');
        }

        $now = time();
        if (isset($payload['nbf']) && $payload['nbf'] > $now) {
            throw new \Exception('Token aún no válido');
        }
        if (isset($payload['exp']) && $payload['exp'] < $now) {
            throw new \Exception('Token expirado');
        }

        return $payload;
    }

    /**
     * Codifica datos en base64 URL safe (sin padding).
     *
     * @param string $data Datos a codificar.
     * @return string Cadena codificada base64 URL safe.
     */
    private static function b64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Decodifica una cadena base64 URL safe.
     *
     * @param string $data Cadena codificada base64 URL safe.
     * @return string Datos decodificados.
     */
    private static function b64urlDecode(string $data): string
    {
        $pad = 4 - (strlen($data) % 4);
        if ($pad < 4) {
            $data .= str_repeat('=', $pad);
        }
        return base64_decode(strtr($data, '-_', '+/')) ?: '';
    }
}
?>
