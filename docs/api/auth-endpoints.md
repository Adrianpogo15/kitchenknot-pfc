# Endpoints de autenticacion

## Base URL

```text
http://TU_IP_LOCAL:3000/api
```

## Registro

`POST /auth/register`

```json
{
  "email": "ana@example.com",
  "username": "ana_cocina",
  "password": "123456",
  "firstName": "Ana",
  "lastName": "Lopez",
  "bio": "Me gustan las recetas caseras",
  "birthDate": "2000-05-10",
  "avatarUrl": null
}
```

## Login

`POST /auth/login`

```json
{
  "email": "ana@example.com",
  "password": "123456"
}
```

## Perfil autenticado

`GET /auth/me`

Header:

```text
Authorization: Bearer TU_TOKEN
```

## Editar perfil

`PUT /auth/me`

Header:

```text
Authorization: Bearer TU_TOKEN
```

Body:

```json
{
  "username": "ana_cocina_fit",
  "firstName": "Ana",
  "lastName": "Lopez",
  "bio": "Recetas faciles y saludables",
  "birthDate": "2000-05-10",
  "avatarUrl": null
}
```

## Baja de usuario

`DELETE /auth/me`

Header:

```text
Authorization: Bearer TU_TOKEN
```
