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
    const userTable = process.env["USER_TABLE"] || "users";
    const loginIdColumn = process.env["LOGIN_ID_COLUMN"] || "loginId";
    const passwordColumn = process.env["PASSWORD_COLUMN"] || "password";
    const userProfileIdColumn = process.env["USER_PROFILE_ID_COLUMN"] || "profileId";

    const historyTable = process.env["HISTORY_TABLE"] || "histories";
    const historyLoginIdColumn = process.env["HISTORY_LOGIN_ID_COLUMN"] || "loginId";
    // const historyOAuthTypeColumn = process.env["HISTORY_OAUTH_TYPE_COLUMN"] || 'oauthType';
    const historySignInTimeColumn = process.env["HISTORY_SIGNIN_TIME_COLUMN"] || "signInTime";
    const historyExpireTimeColumn = process.env["HISTORY_EXPIRE_TIME_COLUMN"] || "expireTime";

    const tokenLifeTime = parseInt(process.env["TOKEN_LIFETIME"] || 300); 

    const selectUserQuery = `SELECT ${userProfileIdColumn} FROM ${userTable} WHERE ${loginIdColumn} = '${loginId}' AND ${passwordColumn} = '${password}' `;
    const insertHistoryQuery = `INSERT INTO ${historyTable} (${historyLoginIdColumn},${historySignInTimeColumn},${historyExpireTimeColumn}) VALUES ('${historyLoginIdColumn}',NOW(), NOW()) `;

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

