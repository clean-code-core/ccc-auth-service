import mariadb, { PoolConnection } from "mariadb";

function createPool(): Promise<PoolConnection> {
    const host = process.env["DATABASE_HOST"] || "ec2-52-79-228-151.ap-northeast-2.compute.amazonaws.com";
    const port = parseInt(process.env["DATABASE_PORT"], 10) || 3306;
    const schema = process.env["DATABASE_DEFAULT_SCHEMA"] || "auth";
    const user = process.env["DATABASE_USERNAME"] || "developer";
    const password = process.env["DATABASE_PASSWORD"] || "!qmffhrtmaltm17";
    const pool = mariadb.createPool({ host, port, user, password });
    let connection: PoolConnection = null;
    return pool.getConnection()
        .then(nextConnection => {
            connection = nextConnection;
            return connection.query(`use ${schema}`);
        })
        .then(() => connection);
}

export { createPool };
