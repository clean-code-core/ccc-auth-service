https://docs.microsoft.com/ko-kr/azure/active-directory/develop/v2-oauth2-auth-code-flow

통합 계정 서버 : https://auth.company.com
API 서버 : https://api.company.com

처음 로그인 하는 경우

0. 로그인 준비
REQUEST
- url : https://api.company.com/oauth/2.0/configuration

RESPONSE
{
    client_id,
    state,
    redirect_uri,
    response_mode: 'query'
}

1. 통합 계정 서버로 로그인
REQUEST [GET]
- url : https://auth.company.com/oauth/2.0/authorize
{
    client_id,
    response_type: 'code',
    redirect_uri,
    scope: 'openid,offline_access',
    response_mode: 'query',
    state,
    prompt: 'login'
}

RESPONSE
- url : https://api.company.com/oauth/2.0/authorize
{
    code:,
    state:,
}

{
    error,
    error_description,
}

2. Token 요청
REQUEST [POST]
- url : https://auth.company.com/oauth/2.0/token
{
    client_id,
    scope
}





2. API 서버로 로그인
- url : https://api.company.com/token
- parameter : code

2.1. API 서버에서 통합게정 서버로 로그인
- url : https://auth.company.com/token







1. Code 생성
- Code 생성을 위한 로그인 페이지 호출 (Baisc / SNS)

2. Token 요청
- 토큰 서버는 Code 검증 (Basic / SNS)
- 토큰 생성 후 응답

A. 회원가입
- 회원가입을 위한 페이지 호출
- 2차 인증 (Option)
- 1. Code 생성 페이지로 이동