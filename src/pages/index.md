---
layout: ../layouts/BaseLayout.astro
---

OpenID Mock Server
==================

This OpenID/Oauth2 mock server is publicly available at https://mock.passwordless.id

It can be used to test libraries, implementations or perform automated integration tests against.

It is not a tutorial on how OAuth2 / OpenID works, it is merely a mock server that you can use as placeholder. It will not show an interactive login screen, but will simulate the sign-in of the user "John Doe" instead.

Getting started
----------------

When using a library, you usually need following information:

- **issuer**: `https://mock.passwordless.id`
- **client_id**: `test`
- **client_secret**: `s3cr3t`


Endpoints
---------

If you need to configure the client manually, here is the list of endpoints:

| Endpoint               | Path                 |
|------------------------|----------------------|
| Authorization Endpoint | `/authorize`         |
| Token Endpoint         | `/token`             |
| UserInfo Endpoint      | `/userinfo`          |
| JWKS Endpoint          | `/.well-known/jwks.json` |
| OpenID Configuration   | `/.well-known/openid-configuration` |


Typical requests
----------------

Here are some typical requests you would perform against the mock server.

### Authorization Request

```http
GET /authorize?response_type=code&client_id=test&redirect_uri=https://example.com/callback&scope=openid%20email%20profile&state=xyz HTTP/1.1
Host: mock.passwordless.id
```

### Token Request

```http
POST /token HTTP/1.1
Host: mock.passwordless.id
Content-Type: application/x-www-form-urlencoded
grant_type=authorization_code&code=AUTH_CODE_HERE&redirect_uri=https://example.com/callback&client_id=test&client_secret=s3cr3t
```

### UserInfo Request

```http
GET /userinfo HTTP/1.1
Host: mock.passwordless.id
Authorization: Bearer ACCESS_TOKEN_HERE
```


When performing the authorization code flow, the server will always return the same user:

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "email_verified": true
}
```

Repeatability
-------------

While the flow is the same on each request, their content is not identical.

The `id_token` contains an `iat` (issued at) timestamp, so it will be different on each request. The `code` remains valid for 1 minute and the `token` (opaque access token) remains valid for 1 hour. This should be sufficient for testing purposes.
