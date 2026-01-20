---
layout: ../layouts/BaseLayout.astro
---

OpenID Mock Server
==================

This OpenID/Oauth2 mock server is a placeholder to safely test libraries, implementations or perform automated integration tests against. The mock user "John Doe" will always be returned.

It is freely available without registration needed. If you like it, [help support it](https://github.com/sponsors/passwordless-id) to keep it running.


Getting started
----------------

When using a library, you usually need following information:

- **issuer**: `https://mock.passwordless.id`
- **client_id**: `MyClient`
- **client_secret**: `MySecret`



Authorization Request
---------------------

<a class="btn" href="/authorize?response_type=code&client_id=MyClient&redirect_uri=https%3A%2F%2Fmock.passwordless.id%2Fcallback&scope=openid%20email%20profile&state=xyz">Try it out</a>



The mock user
-------------

When performing the authorization code flow, the server will always return the same user:

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john.doe@example.org",
  "email_verified": true
}
```


Sources & Docs
--------------

[https://github.com/passwordless-id/mock](https://github.com/passwordless-id/mock)