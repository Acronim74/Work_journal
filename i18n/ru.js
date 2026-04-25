const LANG_RU = {
  code: 'ru',
  name: 'Русский',
  flag: '🇷🇺',

  appTitle: 'РАБ.ЖУРНАЛ',

  nav_journal: 'Журнал',
  nav_categories: 'Категории',
  nav_reports: 'Отчёты',
  nav_settings: 'Настройки',

  stat_total: 'Записей всего',
  stat_month: 'За этот месяц',
  stat_cats: 'Категорий',

  btn_newEntry: '+ Новая запись',
  btn_add: '+ Добавить',
  btn_save: 'Сохранить',
  btn_cancel: 'Отмена',
  btn_edit: 'Редактировать',
  btn_delete: 'Удалить',
  btn_export: '↑ Экспорт',
  btn_import: '↓ Импорт',
  btn_exportJson: '↑ Скачать .json',
  btn_importJson: '↓ Загрузить .json',
  btn_clearAll: '🗑 Очистить',
  btn_resetFilters: '✕ Сброс',
  btn_addPart: '+ добавить позицию',
  btn_generateReport: '⎙ Сформировать отчёт',
  btn_print: '🖨 Печать',
  btn_closeReport: '✕ Закрыть',
  'theme_toggle:title': 'Переключить тему',

  filter_search: 'Поиск по описанию...',
  filter_allCats: 'Все категории',
  filter_dateFrom: 'С даты',
  filter_dateTo: 'По дату',

  modal_newEntry: 'Новая запись',
  modal_editEntry: 'Редактировать запись',
  field_date: 'Дата',
  field_category: 'Категория',
  field_catPlaceholder: '— выберите —',
  field_description: 'Описание работы',
  field_descPlaceholder: 'Краткое описание задачи / объекта',
  field_actions: 'Выполненные действия',
  field_actionsPlaceholder: 'Что именно было сделано...',
  field_parts: 'Запчасти и материалы',
  field_partName: 'Наименование',
  field_partQty: 'Кол-во',

  modal_newCat: 'Новая категория',
  field_catName: 'Название',
  field_catNamePlaceholder: 'Электрика, Сантехника...',

  card_actions: 'Выполненные действия',
  card_parts: 'Запчасти / Материалы',

  empty_journal_title: 'Записей нет',
  empty_journal_text: 'Нажмите «Новая запись» чтобы добавить первую',
  empty_cats_title: 'Категорий нет',
  empty_cats_text: 'Добавьте первую категорию',
  empty_report_title: 'Нет данных за выбранный период',
  empty_report_text: 'Измените диапазон дат или фильтр категорий',

  report_title: 'Отчёты',
  report_period_label: 'Период',
  report_period_custom: 'Произвольный период',
  report_period_week: 'Эта неделя',
  report_period_month: 'Этот месяц',
  report_period_quarter: 'Этот квартал',
  report_period_year: 'Этот год',
  report_cat_filter: 'Категории',
  report_cat_all: 'Все категории',
  report_date_from: 'Дата начала',
  report_date_to: 'Дата окончания',
  report_preview_title: 'Предварительный просмотр',
  report_entries_count: (n) => `${n} ${n === 1 ? 'запись' : n < 5 ? 'записи' : 'записей'}`,
  report_no_category: 'Без категории',
  report_doc_title: 'Отчёт о выполненных работах',
  report_period_text: (from, to) => `Период: ${from} — ${to}`,
  report_generated: (date) => `Сформирован: ${date}`,
  report_total_entries: (n) => `Всего записей: ${n}`,
  report_section_actions: 'Выполненные действия:',
  report_section_parts: 'Использованные материалы:',
  report_tab_journal: 'Журнал работ',
  report_tab_issues: 'Поломки',
  report_tab_plans: 'Планы',
  report_doc_issues: 'Отчёт по поломкам',
  report_doc_plans: 'Отчёт по планам',
  report_total_issues: (n) => `Всего записей: ${n}`,
  report_total_plans: (n) => `Всего планов: ${n}`,
  empty_report_issues_title: 'Нет поломок за период',
  empty_report_issues_text: 'Измените даты или фильтр категорий',
  empty_report_plans_title: 'Нет планов за период',
  empty_report_plans_text: 'Измените даты или фильтр категорий',
  report_section_notes: 'Заметки:',
  report_plan_dates_label: 'Срок:',

  settings_linked_file_label: 'Файл базы без сервера',
  settings_linked_file_desc: 'Один раз укажите JSON в общей папке (сетевой диск и т.д.). Работает в Chrome и Microsoft Edge. Экспорт, импорт и автосохранение пойдут в этот файл без Node.',
  settings_link_db_open: 'Указать существующий .json',
  settings_link_db_new: 'Создать work-journal-db.json',
  settings_unlink_db_file: 'Отвязать файл',
  settings_linked_file_unsupported: 'Нужны Chrome или Microsoft Edge. В других браузерах используйте «Импорт» и скачивание .json.',
  settings_linked_file_active: (name) => `Привязан файл: ${name}`,
  settings_linked_file_none: 'Файл не привязан — используются только данные в этом браузере.',

  settings_electron_db_desc: 'Рабочая копия: work-journal-db.json рядом с программой (и при закрытии окна). Резерв для переноса: папка journal-exchange.',
  settings_export_label: 'Экспорт базы данных',
  settings_export_desc: 'Настольная версия: файл journal-exchange/work-journal-backup.json. Браузер: скачивание JSON.',
  settings_import_label: 'Импорт базы данных',
  settings_import_desc: 'Настольная версия: из journal-exchange/work-journal-backup.json. Браузер: выбор файла.',
  settings_clear_label: 'Очистить все данные',
  settings_clear_desc: 'Удалить все записи и категории (необратимо!)',
  settings_lang_label: 'Язык интерфейса',
  settings_lang_desc: 'Язык меню и подписей (данные не затрагиваются)',
  settings_about_title: 'О приложении',
  settings_about_text: 'Рабочий журнал v1.1\nБаза данных: IndexedDB (локально, в браузере)\nДанные не передаются в интернет\nДля переноса используйте экспорт/импорт',

  toast_entrySaved: 'Запись добавлена',
  toast_entryUpdated: 'Запись обновлена',
  toast_entryDeleted: 'Запись удалена',
  toast_catAdded: 'Категория добавлена',
  toast_catDeleted: 'Категория удалена',
  toast_catExists: 'Категория уже существует',
  toast_exported: 'База экспортирована',
  toast_db_saved_file: 'База записана в work-journal-db.json',
  toast_export_saved_exchange: (rel) => `Копия сохранена: ${rel}`,
  toast_import_exchange_missing: (rel) => `Нет файла ${rel}. Сначала нажмите «Экспорт».`,
  toast_exported_download: 'Файл скачан (откройте приложение через Electron для авто-сохранения)',
  toast_db_save_failed: 'Не удалось сохранить файл базы',
  toast_imported: (n) => `Импортировано: ${n} записей`,
  toast_cleared: 'Все данные удалены',
  toast_badFile: 'Неверный формат файла',
  toast_noData: 'Файл не содержит нужных данных',
  val_date: 'Укажите дату',
  val_desc: 'Заполните описание работы',
  val_catName: 'Введите название',
  val_report_dates: 'Укажите даты периода',

  confirm_deleteEntry: 'Удалить запись?',
  confirm_deleteCat: (name, count) => count > 0
    ? `Категория "${name}" используется в ${count} записях. Удалить? (Записи останутся)`
    : `Удалить категорию "${name}"?`,
  confirm_import: (e, c) => `Импортировать ${e} записей и ${c} категорий?\n\nСуществующие данные будут ЗАМЕНЕНЫ.`,
  confirm_clearAll: 'Удалить ВСЕ данные? Это действие необратимо!',

  formatDate: (y, m, d) => `${d}.${m}.${y}`,
  headerDate: (date) => {
    const wd = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    const mo = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    return `${wd[date.getDay()]}, ${date.getDate()} ${mo[date.getMonth()]} ${date.getFullYear()}`;
  },
  catRecords: (n) => `${n} зап.`,

  card_issue_found: (d) => `Обнаружена: ${d}`,
  card_issue_resolved: (d) => `Устранена: ${d}`,
  badge_from_issue: 'поломка',
  badge_from_issue_tip: 'Запись создана при устранении поломки',
  modal_resolveIssue: 'Устранение поломки',
  field_resolveDate: 'Дата устранения (в журнал работ)',
  btn_save_resolve: 'Сохранить в журнал',
  issue_resolve_use_list_button: 'Чтобы закрыть поломку, нажмите «Устранена» в списке и заполните форму устранения.',
  issue_reopen_confirm: 'Снова открыть поломку? Запись в журнале работ останется, связь со статусом будет снята.',
  issue_resolve_entry_title: (desc) => `Устранение: ${desc}`,
  toast_issue_resolved_logged: 'Сохранено в журнал работ',
  issue_resolution_section: 'Как устранено',
  view_issue_more: 'Подробнее — поломки',
  view_issue_found_line: (d) => `Обнаружение: ${d}`,
  view_issue_resolved_line: (d) => `Устранение: ${d}`,

  card_plan_planned_line: (d) => `По плану: ${d}`,
  card_plan_done_line: (d) => `Выполнено: ${d}`,
  badge_from_plan: 'план',
  badge_from_plan_tip: 'Запись из выполненного плана',
  modal_resolvePlan: 'Завершение плана',
  field_planRefPeriod: 'Срок в плане',
  field_plan_done_date: 'Дата выполнения (в журнал работ)',
  btn_save_plan_resolve: 'Сохранить в журнал',
  plan_resolve_use_list_button: 'Чтобы отметить выполнение, нажмите «Выполнено» в списке планов и заполните форму.',
  plan_reopen_confirm: 'Вернуть план в «Запланировано»? Запись в журнале останется, связь будет снята.',
  plan_resolve_entry_title: (desc) => `По плану: ${desc}`,
  toast_plan_done_logged: 'Сохранено в журнал работ',
  plan_completion_section: 'Как выполнено',
  view_plan_more: 'Подробнее — планы',
  view_plan_planned_line: (d) => `Срок: ${d}`,
  view_plan_done_line: (d) => `Выполнено: ${d}`,
};

// Snapshot strings (appended)
LANG_RU.nav_archive = 'Архив';
LANG_RU.snap_empty_title = 'Архив пуст';
LANG_RU.snap_empty_text = 'Снимки создаются автоматически перед очисткой или вручную';
LANG_RU.snap_empty_nothing = 'Нечего сохранять — база пуста';
LANG_RU.snap_created = 'Снимок создан';
LANG_RU.snap_restored = 'База восстановлена из снимка';
LANG_RU.snap_deleted = 'Снимок удалён';
LANG_RU.snap_notFound = 'Снимок не найден';
LANG_RU.snap_btn_restore = 'Восстановить';
LANG_RU.snap_btn_download = 'Скачать как JSON';
LANG_RU.btn_manualSnap = '📷 Создать снимок';
LANG_RU.snap_reason_manual = 'Ручной снимок';
LANG_RU.snap_reason_before_clear = 'Перед очисткой';
LANG_RU.snap_reason_before_import = 'Перед импортом';
LANG_RU.snap_label_beforeRestore = 'Перед восстановлением';
LANG_RU.snap_entries = (n) => `${n} зап.`;
LANG_RU.snap_cats = (n) => `${n} кат.`;
LANG_RU.snap_tasks = (n) => `${n} задач`;
LANG_RU.snap_confirm_restore = (date, count) =>
  `Восстановить базу из снимка от ${date}?\n(${count} записей)\n\nТекущее состояние будет сохранено в архив.`;
LANG_RU.snap_confirm_delete = 'Удалить этот снимок? Действие необратимо.';
LANG_RU.archive_title = 'Архив снимков';
LANG_RU.archive_desc = 'Автоматические и ручные снимки базы данных';

LANG_RU.photo_add = 'Добавить фото';
LANG_RU.photo_remove = 'Удалить фото';
LANG_RU.photo_count = (n, max) => `${n} из ${max} фото`;
LANG_RU.photo_limit = `Максимум ${10} фотографий`;
LANG_RU.photo_limit_trunc = (n) => `Добавлено первые ${n} фото (лимит исчерпан)`;
LANG_RU.photo_not_image = 'Не является изображением';
LANG_RU.photo_section = 'Фотографии';
LANG_RU.photo_link_added = (name) => `Добавлена ссылка на фото. Поместите файл «${name}» в photos/journal или photos/issues (или в корень photos для старых записей).`;
LANG_RU.btn_view = '👁 Подробнее';
LANG_RU.view_modal_title = 'Просмотр записи';
LANG_RU.view_edit = 'Редактировать';
LANG_RU.view_actions_label = 'Выполненные действия';
LANG_RU.view_parts_label = 'Запчасти и материалы';
LANG_RU.view_photos_label = 'Фотографии';
LANG_RU.btn_help = '? Помощь';

// Header lang picker
LANG_RU.lang_compact = '🇷🇺';

// Issues (поломки)
LANG_RU.nav_issues = 'Поломки';
LANG_RU.issues_title = 'Журнал поломок';
LANG_RU.btn_newIssue = '+ Новая поломка';
LANG_RU.modal_newIssue = 'Новая поломка';
LANG_RU.modal_editIssue = 'Редактировать поломку';
LANG_RU.field_issueDesc = 'Описание поломки';
LANG_RU.field_issueDescPlaceholder = 'Что сломалось / где';
LANG_RU.field_issueNotes = 'Заметки / подробности';
LANG_RU.field_issueNotesPlaceholder = 'Дополнительная информация...';
LANG_RU.field_priority = 'Приоритет';
LANG_RU.field_status = 'Статус';
LANG_RU.priority_low = 'Низкий';
LANG_RU.priority_medium = 'Средний';
LANG_RU.priority_high = 'Высокий';
LANG_RU.priority_critical = 'Критический';
LANG_RU.status_open = 'Открыта';
LANG_RU.status_inprogress = 'В работе';
LANG_RU.status_resolved = 'Устранена';
LANG_RU.empty_issues_title = 'Поломок нет';
LANG_RU.empty_issues_text = 'Нажмите «+ Новая поломка» чтобы зафиксировать';
LANG_RU.toast_issueSaved = 'Поломка добавлена';
LANG_RU.toast_issueUpdated = 'Поломка обновлена';
LANG_RU.toast_issueDeleted = 'Поломка удалена';
LANG_RU.confirm_deleteIssue = 'Удалить запись о поломке?';
LANG_RU.field_dateFound = 'Дата обнаружения';
LANG_RU.stat_issues_open = 'Открытых поломок';

// Plans (планирование)
LANG_RU.nav_plans = 'Планы';
LANG_RU.plans_title = 'Планирование';
LANG_RU.btn_newPlan = '+ Новый план';
LANG_RU.modal_newPlan = 'Новый план';
LANG_RU.modal_editPlan = 'Редактировать план';
LANG_RU.field_planDesc = 'Описание задачи';
LANG_RU.field_planDescPlaceholder = 'Что нужно сделать';
LANG_RU.field_datePlanned = 'Плановая дата';
LANG_RU.field_datePlannedFrom = 'С даты';
LANG_RU.field_datePlannedEnd = 'По дату';
LANG_RU.field_planPeriodType = 'Срок плана';
LANG_RU.plan_mode_single = 'Один день';
LANG_RU.plan_mode_range = 'Период';
LANG_RU.field_planActions = 'Планируемые действия';
LANG_RU.val_plan_range_order = 'Дата окончания не может быть раньше даты начала';
LANG_RU.val_plan_date = 'Укажите плановую дату';
LANG_RU.val_plan_end_date = 'Укажите дату окончания периода';
LANG_RU.field_planActionsPlaceholder = 'Что планируется сделать...';
LANG_RU.status_planned = 'Запланировано';
LANG_RU.status_done = 'Выполнено';
LANG_RU.empty_plans_title = 'Планов нет';
LANG_RU.empty_plans_text = 'Нажмите «+ Новый план» чтобы добавить задачу';
LANG_RU.toast_planSaved = 'План добавлен';
LANG_RU.toast_planUpdated = 'План обновлён';
LANG_RU.toast_planDeleted = 'План удалён';
LANG_RU.confirm_deletePlan = 'Удалить план?';
LANG_RU.plan_mark_done = '✓ Выполнено';
LANG_RU.plan_mark_planned = '↺ Вернуть';
LANG_RU.stat_plans_pending = 'Активных планов';
LANG_RU.filter_status_all = 'Все статусы';

// Tasks (очередь)
LANG_RU.nav_tasks = 'Задачи';
LANG_RU.tasks_title = 'Задачи';
LANG_RU.tasks_search_placeholder = 'Поиск по задаче / дополнениям / кому поручено...';
LANG_RU.tasks_filter_active = 'Активные';
LANG_RU.tasks_filter_returned = 'Возвращённые';
LANG_RU.tasks_filter_open = 'Активные + возвращённые';
LANG_RU.tasks_filter_completed = 'Завершённые';
LANG_RU.tasks_filter_all = 'Все';
LANG_RU.tasks_modal_create_title = 'В очередь задач';
LANG_RU.tasks_modal_append_title = 'Дополнение к задаче';
LANG_RU.tasks_modal_complete_title = 'Завершение и запись в журнал';
LANG_RU.tasks_field_source = 'Источник';
LANG_RU.tasks_field_assignees = 'Кому поручено';
LANG_RU.tasks_field_optional = '(необязательно)';
LANG_RU.tasks_assignees_placeholder = 'Например: Иванов, бригада №2…';
LANG_RU.tasks_field_append = 'Текст дополнения';
LANG_RU.tasks_val_append = 'Введите текст дополнения';
LANG_RU.tasks_btn_enqueue = 'Добавить';
LANG_RU.tasks_toast_enqueued = 'Задача добавлена в очередь';
LANG_RU.tasks_btn_to_tasks = 'В Задачи';
LANG_RU.tasks_btn_append = 'Дополнить';
LANG_RU.tasks_btn_return = 'Вернуть';
LANG_RU.tasks_queued_chip = 'В очереди задач';
LANG_RU.tasks_badge_plan = 'План';
LANG_RU.tasks_badge_issue = 'Поломка';
LANG_RU.tasks_status_active = 'Активна';
LANG_RU.tasks_status_returned = 'Возвращена';
LANG_RU.tasks_status_completed = 'Завершена';
LANG_RU.tasks_status_completed_source = 'Закрыто из плана/поломок';
LANG_RU.tasks_empty_title = 'Задач нет';
LANG_RU.tasks_empty_text = 'Добавьте задачу кнопкой «В Задачи» в карточке плана или поломки';
LANG_RU.tasks_append_saved = 'Дополнение сохранено';
LANG_RU.tasks_sync_append_failed = 'Не удалось записать дополнение в план или поломку';
LANG_RU.tasks_returned = 'Задача отмечена как возвращённая';
LANG_RU.tasks_completed = 'Задача завершена';
LANG_RU.tasks_completed_linked = 'Задача закрыта: источник уже завершён в журнале';
LANG_RU.tasks_err_active_exists = 'У этого источника уже есть активная задача';
LANG_RU.tasks_err_source_closed = 'Источник уже закрыт — задача будет синхронизирована';
LANG_RU.tasks_err_missing_source = 'Источник не найден (возможно, удалён)';
LANG_RU.tasks_err_double_resolve = 'Уже сохранено в журнал — повторное закрытие отменено';
LANG_RU.tasks_log_title = 'Дополнения';
LANG_RU.tasks_assigned_prefix = 'Поручено:';
LANG_RU.tasks_print_title = 'Задача';

// Inventory
LANG_RU.nav_inventory = 'Инвентаризация';
LANG_RU.inv_title = 'Инвентаризация';
LANG_RU.inv_btn_templates = 'Шаблоны';
LANG_RU.inv_btn_own_template = 'Свой шаблон';
LANG_RU.inv_btn_duplicate_template = 'Копия';
LANG_RU.inv_btn_back_to_records = '← К описям';
LANG_RU.inv_btn_new_record = '+ Новая опись';
LANG_RU.inv_btn_new_template = '+ Новый шаблон';
LANG_RU.inv_btn_add_field = 'добавить поле';
LANG_RU.inv_btn_add_item = 'Добавить позицию';
LANG_RU.inv_btn_print = 'Печать';
LANG_RU.inv_btn_archive = 'В архив';
LANG_RU.inv_btn_restore = 'Восстановить';
LANG_RU.inv_btn_rename = 'Переименовать';
LANG_RU.inv_search_placeholder = 'Поиск по названию описи...';
LANG_RU.inv_items_search_placeholder = 'Поиск по позициям...';
LANG_RU.inv_filter_all_templates = 'Все шаблоны';
LANG_RU.inv_empty_title = 'Описей пока нет';
LANG_RU.inv_empty_text = 'Создайте первую опись по шаблону';
LANG_RU.inv_no_items = 'Позиций нет — нажмите «Добавить позицию»';
LANG_RU.inv_record_unnamed = '— без названия —';
LANG_RU.inv_record_template_label = 'Шаблон';
LANG_RU.inv_record_date_label = 'Дата';
LANG_RU.inv_record_items_label = 'Позиций';
LANG_RU.inv_record_not_found = 'Опись не найдена';
LANG_RU.inv_tpl_title = 'Шаблоны инвентаризации';
LANG_RU.inv_tpl_show_archived = 'Показать архив';
LANG_RU.inv_tpl_empty_title = 'Нет шаблонов';
LANG_RU.inv_tpl_empty_text = 'Создайте первый шаблон описи';
LANG_RU.inv_tpl_unnamed = '— без названия —';
LANG_RU.inv_tpl_unknown = '— шаблон не найден —';
LANG_RU.inv_tpl_fields_label = 'Поля';
LANG_RU.inv_tpl_no_fields = 'Поля не добавлены';
LANG_RU.inv_tpl_empty_editor_hint = 'Список полей пуст. Нажмите «добавить поле» ниже: задайте название столбца и тип (текст, число, список, дата, да/нет).';
LANG_RU.inv_tpl_badge_archived = 'архив';
LANG_RU.inv_modal_template_title = 'Шаблон описи';
LANG_RU.inv_modal_template_new_title = 'Новый шаблон';
LANG_RU.inv_modal_template_edit_title = 'Редактирование шаблона';
LANG_RU.inv_modal_new_record_title = 'Новая опись';
LANG_RU.inv_modal_item_title = 'Позиция описи';
LANG_RU.inv_modal_item_add_title = 'Новая позиция';
LANG_RU.inv_modal_item_edit_title = 'Редактирование позиции';
LANG_RU.inv_field_template_name = 'Название шаблона';
LANG_RU.inv_field_template_desc = 'Описание (необязательно)';
LANG_RU.inv_field_template_fields = 'Поля';
LANG_RU.inv_field_record_template = 'Шаблон';
LANG_RU.inv_field_record_name = 'Название описи';
LANG_RU.inv_field_record_date = 'Дата';
LANG_RU.inv_field_label_placeholder = 'Название поля';
LANG_RU.inv_field_options_label = 'Варианты (через запятую)';
LANG_RU.inv_field_unit_placeholder = 'ед.';
LANG_RU.inv_field_required = 'Обязательное';
LANG_RU.inv_field_type_text = 'Текст';
LANG_RU.inv_field_type_number = 'Число';
LANG_RU.inv_field_type_select = 'Список';
LANG_RU.inv_field_type_date = 'Дата';
LANG_RU.inv_field_type_boolean = 'Да/Нет';
LANG_RU.inv_confirm_remove_field = 'Удалить это поле из шаблона?';
LANG_RU.inv_confirm_archive_template = 'Отправить шаблон в архив? Создавать новые описи по нему будет нельзя.';
LANG_RU.inv_confirm_delete_record = 'Удалить эту опись со всеми позициями?';
LANG_RU.inv_confirm_delete_item = 'Удалить эту позицию?';
LANG_RU.inv_confirm_edit_item = 'Сохранить изменения позиции?';
LANG_RU.inv_err_template_name_required = 'Укажите название шаблона';
LANG_RU.inv_err_template_fields_required = 'Добавьте хотя бы одно поле';
LANG_RU.inv_err_record_name_required = 'Укажите название описи';
LANG_RU.inv_err_template_required = 'Выберите шаблон';
LANG_RU.inv_err_template_missing = 'Шаблон не найден';
LANG_RU.inv_err_template_archived = 'Шаблон в архиве — выберите другой';
LANG_RU.inv_err_no_active_templates = 'Нет активных шаблонов — создайте шаблон';
LANG_RU.inv_err_field_required = 'Обязательное поле:';
LANG_RU.inv_err_popup_blocked = 'Откройте всплывающие окна для печати';
LANG_RU.inv_toast_template_saved = 'Шаблон сохранён';
LANG_RU.inv_toast_template_duplicated = 'Создана копия шаблона';
LANG_RU.inv_tpl_copy_suffix = ' (копия)';
LANG_RU.inv_toast_template_sync_failed = 'Шаблон сохранён, но не удалось обновить связанные описи (см. консоль)';
LANG_RU.inv_toast_template_archived = 'Шаблон в архиве';
LANG_RU.inv_toast_template_restored = 'Шаблон восстановлен';
LANG_RU.inv_toast_record_created = 'Опись создана';
LANG_RU.inv_toast_record_deleted = 'Опись удалена';
LANG_RU.inv_toast_record_renamed = 'Опись переименована';
LANG_RU.inv_toast_item_added = 'Позиция добавлена';
LANG_RU.inv_toast_item_updated = 'Позиция обновлена';
LANG_RU.inv_toast_item_deleted = 'Позиция удалена';
LANG_RU.inv_prompt_rename_record = 'Новое название описи:';
LANG_RU.inv_print_date = 'Дата';
LANG_RU.inv_default_field_desc = 'Описание';
LANG_RU.inv_default_field_qty = 'Количество';
LANG_RU.inv_seed_tpl_name = 'Запасные части (минимум)';
LANG_RU.inv_seed_tpl_desc = 'Базовый шаблон. Можно изменить или отправить в архив.';
LANG_RU.inv_seed_field_desc = 'Описание';
LANG_RU.inv_seed_field_part = 'Номер по каталогу';
LANG_RU.inv_seed_field_qty = 'Количество';
LANG_RU.inv_seed_field_loc = 'Место хранения';
LANG_RU.inv_seed_unit_pcs = 'шт';
LANG_RU.inv_btn_open = 'Открыть';
LANG_RU.inv_btn_create = 'Создать';
LANG_RU.inv_btn_edit_short = 'Изм.';
LANG_RU.inv_yes = 'Да';
LANG_RU.inv_no = 'Нет';
