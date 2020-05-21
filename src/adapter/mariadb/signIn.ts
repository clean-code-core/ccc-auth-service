import { createPool } from "./pool";
import { PoolConnection } from "mariadb";

interface SignInResult {
    result: boolean;
    profileId?: number;
    error?: any;
    end?: () => void;
}

interface SignIn {
    (loginId: string, password: string): Promise<SignInResult>;
}

const signIn: SignIn = function (loginId, password) {
    const userTable = process.env["USER_TABLE"];
    const loginIdColumn = process.env["LOGIN_ID_COLUMN"];
    const passwordColumn = process.env["PASSWORD_COLUMN"];
    const userProfileIdColumn = process.env["USER_PROFILE_ID_COLUMN"];

    const selectUserQuery = `SELECT ${userProfileIdColumn} FROOM ${userTable} WHERE ${loginIdColumn} = '${loginId}' AND ${passwordColumn} = '${password}' `;
    const insertHistoryQuery = `INSERT INTO ${} ${userProfileIdColumn} FROOM ${userTable} WHERE ${loginIdColumn} = '${loginId}' AND ${passwordColumn} = '${password}' `;

    let connectionReserved: PoolConnection = null;
    let profileId: number;

    function end(){
        if (connectionReserved !== null) {
            connectionReserved.end();
        }
    };

    return createPool()
        .then(connection => {
            connectionReserved = connection;
            return connection.query(selectUserQuery);
        })
        .then((nextProfileId: number) => {
            profileId = nextProfileId;
            return connectionReserved.query(insertHistoryQuery);
        })
        .then(()=>({ result: true, profileId, end }))
        .catch(error => ({ result: false, error, end }));
};

