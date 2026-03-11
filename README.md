## Top API: MinIO

Проект использует MinIO как S3-совместимое хранилище файлов.

Клиент получает прямой URL в MinIO и скачивает файл без проксирования через backend.

## Быстрый старт

1. Скопируйте `.env.example` в `.env`.
2. Поднимите стек:

```bash
docker compose up -d --build
```

`minio-init` автоматически:
- подключается к MinIO через `mc`;
- создаёт bucket (если его нет);
- включает публичный доступ `anonymous download` для bucket.

## Прямой доступ к файлам

После загрузки backend возвращает URL вида:

- `http://localhost:9000/<bucket>/<object-key>`
- пример: `http://localhost:9000/files/public/other/2026/03/10/<uuid>.png`

## Переменные окружения

Все переменные задаются в `.env`.

### Общие

- `PORT` - HTTP-порт NestJS.

### MongoDB

- `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_HOST`, `MONGO_PORT`, `MONGO_DB`.

### JWT

- `JWT_SECRET`, `JWT_EXPIRES_IN`.

### MinIO (backend)

- `MINIO_ENDPOINT` - host MinIO для SDK (`minio` в Docker-сети).
- `MINIO_PORT` - порт S3 API MinIO (обычно `9000`).
- `MINIO_ACCESS_KEY` - access key, которым backend пишет объекты.
- `MINIO_SECRET_KEY` - secret key для backend.
- `MINIO_BUCKET` - bucket для файлов.
- `MINIO_PUBLIC_ENDPOINT` - публичная база для прямых ссылок (локально `http://localhost:9000`).

### MinIO (docker)

- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` - root-учётка MinIO.
- `MINIO_CONSOLE_PORT` - порт MinIO Console (`9001`).
