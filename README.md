# Work Journal

Локальный журнал работ/поломок/планов на Electron для Windows (включая portable-сборку).

## Что умеет

- Журнал работ с фото, запчастями и действиями
- Журнал поломок со статусами и привязкой устранения к записи в журнале
- Планы работ: при выполнении создают запись в журнале
- Печать отчетов (журнал, поломки, планы) с фото
- Интерфейс на RU / EN / PL
- Полностью офлайн, включая spellcheck (встроенные словари `.bdic`)

## Требования для разработки

- Node.js 18+ (рекомендуется LTS)
- npm (входит в Node.js)

## Запуск в dev-режиме

```bash
npm install
npm start
```

## Сборка Windows

Полная сборка (`nsis` + `portable`):

```bash
npx electron-builder --win
```

Только portable:

```bash
npx electron-builder --win portable
```

Если в PowerShell команда `npx` не находится:

```powershell
& "C:\Program Files\nodejs\npx.cmd" electron-builder --win portable
```

Готовый файл:

`dist/Work Journal-<version>-portable-x64.exe`

## Данные и перенос

Приложение хранит данные рядом с portable `.exe`:

- `work-journal-db.json`
- `photos/`
- `journal-exchange/`

Для переноса на другой ПК достаточно скопировать папку с portable `.exe` вместе с этими данными.

## Структура проекта

```text
work-journal/
├── main.js
├── preload.js
├── index.html
├── css/
├── js/
│   ├── app.js
│   ├── db.js
│   ├── i18n.js
│   ├── photos.js
│   ├── report.js
│   └── snapshot.js
├── i18n/
├── dictionaries/
├── fonts/
└── package.json
```
