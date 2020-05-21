import mariadb, { PoolConnection } from "mariadb";

function createPool(): Promise<PoolConnection> {
    const host = process.env["DATABASE_HOST"];
    const port = parseInt(process.env["DATABASE_PORT"], 10) || 3306;
    const schema = process.env["DATABASE_DEFAULT_SCHEMA"] || "auth";
    const user = process.env["DATABASE_USERNAME"];
    const password = process.env["DATABASE_PASSWORD"];
    const pool = mariadb.createPool({ host, port, user, password });
    return pool.getConnection()
        .then(connection => {
            connection.query(`use ${schema}`);
            return connection;
        });
}

export { createPool };