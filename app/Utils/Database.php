<?php
// app/Utils/Database.php
declare(strict_types=1);

/**
 * Gestor de Conexión a Base de Datos
 * 
 * Proporciona acceso centralizado a la base de datos MySQL/MariaDB mediante el patrón
 * Singleton. Encapsula todas las operaciones de consulta con soporte para prepared
 * statements, prevención de inyecciones SQL y manejo robusto de errores.
 * 
 * Operaciones soportadas:
 * - fetchOne: obtener un registro
 * - fetchAll: obtener múltiples registros
 * - execute: ejecutar INSERT/UPDATE/DELETE
 * - getLastInsertId: obtener ID del último registro insertado
 */
/**
 * Clase Database
 *
 * Implementa un gestor de conexión a base de datos MySQL/MariaDB usando el patrón Singleton.
 * Proporciona métodos seguros para consultas y operaciones de escritura.
 */
class Database
{
    /**
     * Instancia singleton de la clase Database.
     * @var self|null
     */
    private static ?self $instance = null;

    /**
     * Conexión activa a MySQL.
     * @var \mysqli
     */
    private \mysqli $connection;

    /**
     * Constructor privado (Patrón Singleton)
     * 
     * Inicializa la conexión a la base de datos con charset UTF-8.
     * Lanza una excepción si la conexión falla.
     * 
     * @throws Exception Si hay error al conectar a la BD.
     */
    private function __construct()
    {
        $this->connection = new \mysqli(
            DB_HOST,
            DB_USER,
            DB_PASS,
            DB_NAME
        );

        // Verificar conexión
        if ($this->connection->connect_error) {
            throw new \Exception('Error de conexión a BD: ' . $this->connection->connect_error);
        }

        // Establecer charset
        $this->connection->set_charset(DB_CHARSET);
    }

    /**
     * Obtener instancia Singleton de la conexión.
     * 
     * @return self
     * @throws Exception Si hay error en la conexión.
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Obtener la conexión MySQLi.
     * 
     * @return \mysqli
     */
    public function getConnection(): \mysqli
    {
        return $this->connection;
    }

    /**
     * Ejecutar una consulta SELECT que devuelve un único registro.
     * 
     * @param string $query
     * @param array $params Valores para binding
     * @param string $types Tipos para prepared statement (e.g. 'si' = string, int)
     * 
     * @return array|null El registro como array asociativo, o null si no hay resultados.
     */
    public function fetchOne(string $query, array $params = [], string $types = ''): ?array
    {
        $result = $this->execute($query, $params, $types);
        if ($result && $result->num_rows > 0) {
            return $result->fetch_assoc();
        }
        return null;
    }

    /**
     * Ejecutar una consulta SELECT que devuelve múltiples registros.
     * 
     * @param string $query
     * @param array $params Valores para binding
     * @param string $types Tipos para prepared statement
     * 
     * @return array Lista de registros como arrays asociativos.
     */
    public function fetchAll(string $query, array $params = [], string $types = ''): array
    {
        $result = $this->execute($query, $params, $types);
        $rows = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
        }
        return $rows;
    }

    /**
     * Ejecutar una consulta INSERT, UPDATE o DELETE.
     * 
     * @param string $query
     * @param array $params Valores para binding
     * @param string $types Tipos para prepared statement
     * 
     * @return ?\mysqli_result Resultado para SELECT, null para otras operaciones
     */
    public function execute(string $query, array $params = [], string $types = ''): ?\mysqli_result
    {
        $stmt = $this->connection->prepare($query);

        if (!$stmt) {
            throw new \Exception('Error en prepared statement: ' . $this->connection->error);
        }

        // Si hay parámetros, hacer binding
        if (!empty($params)) {
            if (empty($types)) {
                // Si no especificó tipos, asumir 's' (string) para todos
                $types = str_repeat('s', count($params));
            }
            $stmt->bind_param($types, ...$params);
        }

        // Ejecutar
        if (!$stmt->execute()) {
            throw new \Exception('Error al ejecutar consulta: ' . $stmt->error);
        }

        // get_result() devuelve null para INSERT/UPDATE/DELETE, mysqli_result para SELECT
        $result = $stmt->get_result();
        return $result === false ? null : $result;
    }

    /**
     * Obtener el ID del último insert.
     * 
     * @return int
     */
    public function getLastInsertId(): int
    {
        return (int) $this->connection->insert_id;
    }

    /**
     * Obtener el número de filas afectadas por la última operación.
     * 
     * @return int
     */
    public function getAffectedRows(): int
    {
        return (int) $this->connection->affected_rows;
    }

    /**
     * Cerrar la conexión.
     */
    public function close(): void
    {
        if (isset($this->connection) && $this->connection instanceof \mysqli) {
            $this->connection->close();
        }
    }

    /**
     * Destructor: cerrar conexión si existe.
     */
    public function __destruct()
    {
        $this->close();
    }
}
?>
