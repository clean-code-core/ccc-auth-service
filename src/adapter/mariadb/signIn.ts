import { createPool } from "./pool";
import { PoolConnection } from "mariadb";

interface HttpResponseError {
    code?: number;
    [key: string]: any;
}

interface SignInResult {
    signOutId?: number;
    profile?: any;
    error?: HttpResponseError;
}

interface SignIn {
    (loginId: string, password: string): Promise<SignInResult>;
}

/**
 * Basic Sign-in 을 수행
 * 클라이언트( 혹은 API 서버)에게 공개할 프로필 정보와, Sign-out 로그를 기록하기 위한 historyId 를 가져온다.
 * 
 * 다음의 작업을 순서대로 수행한다.
 * 1. 입력 값인 로그인 아이디와 비밀번호와 일치하는 사용자가 있는지 확인힌다.
 * 2. 로그 테이블에 사용자의 Sign-in 시각과 토큰 만료 시각을 기록한다.
 * 3. 클라이언트에게 공개할 프로필을 조회한다.
 */

const signIn: SignIn = function (loginId, password): Promise<SignInResult> {
    const userTable = process.env["USER_TABLE"] || "users";
    const loginIdColumn = process.env["LOGIN_ID_COLUMN"] || "loginId";
    const passwordColumn = process.env["PASSWORD_COLUMN"] || "password";
    const userProfileIdColumn = process.env["USER_PROFILE_ID_COLUMN"] || "profileId";

    const historyTable = process.env["HISTORY_TABLE"] || "histories";
    const historyLoginIdColumn = process.env["HISTORY_LOGIN_ID_COLUMN"] || "loginId";
    // const historyOAuthTypeColumn = process.env["HISTORY_OAUTH_TYPE_COLUMN"] || 'oauthType';
    const historySignInTimeColumn = process.env["HISTORY_SIGNIN_TIME_COLUMN"] || "signInTime";
    const historyExpireTimeColumn = process.env["HISTORY_EXPIRE_TIME_COLUMN"] || "expireTime";

    const tokenLifeTime = (process.env["TOKEN_LIFETIME"] && parseInt(process.env["TOKEN_LIFETIME"], 10)) || 300;

    const profileTable = process.env["PROFILE_TABLE"] || "profiles";
    const profileIdColumn = process.env["PROFILE_ID_COLUMN"] || "profileId";


    const selectUserQuery = `SELECT ${userProfileIdColumn} FROM ${userTable} WHERE ${loginIdColumn} = '${loginId}' AND ${passwordColumn} = '${password}';`;
    const insertHistoryQuery = `INSERT INTO ${historyTable} (${historyLoginIdColumn},${historySignInTimeColumn},${historyExpireTimeColumn}) VALUES ('${loginId}',NOW(), NOW() + INTERVAL ${tokenLifeTime} SECOND);`;
    const selectHistoryIdQuery = `SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_name = '${historyTable}' AND table_schema = DATABASE( );`;

    let connectionReserved: PoolConnection = null;
    let profileId: number;
    let signOutId: number;

    return createPool()
        .then(connection => {
            connectionReserved = connection;
            return connection.query(selectUserQuery);
        })
        .then(([user]) => {
            if (user === undefined) {
                const error: HttpResponseError = {
                    code: 401
                };
                throw (error);
            }
            profileId = user[userProfileIdColumn];
            return connectionReserved.query(selectHistoryIdQuery);
        })
        .then(([history]) => {
            if (history === undefined) {
                const error: HttpResponseError = {
                    code: 500
                };
                throw (error);
            }
            signOutId = history["AUTO_INCREMENT"];
            return connectionReserved.query(insertHistoryQuery);
        })
        .then(() => {
            const selectProfileQuery = `SELECT * FROM ${profileTable} WHERE ${profileIdColumn} = ${profileId}`;
            return connectionReserved.query(selectProfileQuery);
        })
        .then(([profile]) => {
            delete profile[profileIdColumn];
            if (connectionReserved !== null) {
                connectionReserved.end();
            }
            return { signOutId, profileId, profile };
        })
        .catch(error => {
            console.error(error);
            if (connectionReserved !== null) {
                connectionReserved.end();
            }
            return { error };
        });
};

export { signIn };

