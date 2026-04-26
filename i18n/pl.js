const LANG_PL = {
  code: 'pl',
  name: 'Polski',
  flag: '🇵🇱',

  appTitle: 'DZIEN.NIK',

  nav_journal: 'Dziennik',
  nav_categories: 'Kategorie',
  nav_reports: 'Raporty',
  nav_settings: 'Ustawienia',

  stat_total: 'Wpisów łącznie',
  stat_month: 'W tym miesiącu',
  stat_cats: 'Kategorii',

  btn_newEntry: '+ Nowy wpis',
  btn_add: '+ Dodaj',
  btn_save: 'Zapisz',
  btn_cancel: 'Anuluj',
  btn_edit: 'Edytuj',
  btn_delete: 'Usuń',
  btn_export: '↑ Eksport',
  btn_import: '↓ Import',
  btn_exportJson: '↑ Pobierz .json',
  btn_importJson: '↓ Wczytaj .json',
  btn_clearAll: '🗑 Wyczyść',
  btn_resetFilters: '✕ Resetuj',
  btn_addPart: '+ dodaj pozycję',
  btn_generateReport: '⎙ Generuj raport',
  btn_print: '🖨 Drukuj',
  btn_closeReport: '✕ Zamknij',
  'theme_toggle:title': 'Zmień motyw',

  filter_search: 'Szukaj w opisie...',
  filter_allCats: 'Wszystkie kategorie',
  filter_dateFrom: 'Od daty',
  filter_dateTo: 'Do daty',

  modal_newEntry: 'Nowy wpis',
  modal_editEntry: 'Edytuj wpis',
  field_date: 'Data',
  field_category: 'Kategoria',
  field_catPlaceholder: '— wybierz —',
  field_description: 'Opis pracy',
  field_descPlaceholder: 'Krótki opis zadania / obiektu',
  field_actions: 'Wykonane czynności',
  field_actionsPlaceholder: 'Co dokładnie zostało zrobione...',
  field_parts: 'Części i materiały',
  field_partName: 'Nazwa',
  field_partQty: 'Ilość',

  modal_newCat: 'Nowa kategoria',
  field_catName: 'Nazwa',
  field_catNamePlaceholder: 'Elektryka, Hydraulika...',

  card_actions: 'Wykonane czynności',
  card_parts: 'Części / Materiały',

  empty_journal_title: 'Brak wpisów',
  empty_journal_text: 'Kliknij «Nowy wpis» aby dodać pierwszy',
  empty_cats_title: 'Brak kategorii',
  empty_cats_text: 'Dodaj pierwszą kategorię',
  empty_report_title: 'Brak danych dla wybranego okresu',
  empty_report_text: 'Zmień zakres dat lub filtr kategorii',

  report_title: 'Raporty',
  report_period_label: 'Okres',
  report_period_custom: 'Własny okres',
  report_period_week: 'Ten tydzień',
  report_period_month: 'Ten miesiąc',
  report_period_quarter: 'Ten kwartał',
  report_period_year: 'Ten rok',
  report_cat_filter: 'Kategorie',
  report_cat_all: 'Wszystkie kategorie',
  report_date_from: 'Data początkowa',
  report_date_to: 'Data końcowa',
  report_preview_title: 'Podgląd',
  report_entries_count: (n) => `${n} ${n === 1 ? 'wpis' : 'wpisów'}`,
  report_no_category: 'Bez kategorii',
  report_doc_title: 'Raport wykonanych prac',
  report_period_text: (from, to) => `Okres: ${from} – ${to}`,
  report_generated: (date) => `Wygenerowano: ${date}`,
  report_total_entries: (n) => `Łącznie wpisów: ${n}`,
  report_section_actions: 'Wykonane czynności:',
  report_section_parts: 'Użyte materiały:',
  report_tab_journal: 'Dziennik prac',
  report_tab_issues: 'Usterki',
  report_tab_plans: 'Plany',
  report_doc_issues: 'Raport usterek',
  report_doc_plans: 'Raport planów',
  report_total_issues: (n) => `Łącznie wpisów: ${n}`,
  report_total_plans: (n) => `Łącznie planów: ${n}`,
  empty_report_issues_title: 'Brak usterek w tym okresie',
  empty_report_issues_text: 'Zmień daty lub filtr kategorii',
  empty_report_plans_title: 'Brak planów w tym okresie',
  empty_report_plans_text: 'Zmień daty lub filtr kategorii',
  report_section_notes: 'Notatki:',
  report_plan_dates_label: 'Termin:',

  settings_electron_db_desc: 'Baza robocza: work-journal-db.json obok programu. Kopia do przeniesienia: folder journal-exchange.',
  settings_export_label: 'Eksport bazy danych',
  settings_export_desc: 'Wersja na PC: plik journal-exchange/work-journal-backup.json. Przeglądarka: pobranie JSON.',
  settings_import_label: 'Import bazy danych',
  settings_import_desc: 'Wersja na PC: z journal-exchange/work-journal-backup.json. Przeglądarka: wybór pliku.',
  settings_clear_label: 'Wyczyść wszystkie dane',
  settings_clear_desc: 'Usuń wszystkie wpisy i kategorie (nieodwracalne!)',
  settings_lang_label: 'Język interfejsu',
  settings_lang_desc: 'Język menu i etykiet (dane nie są zmieniane)',
  settings_about_title: 'O aplikacji',
  settings_about_text: 'Dziennik pracy v1.1\nBaza danych: IndexedDB (lokalnie, w przeglądarce)\nDane nie są wysyłane do internetu\nDo przenoszenia używaj eksport/import',
  settings_copyright_line: '© AppHarbor.studio — studio aplikacji offline.',
  sidebar_copyright_line: '© AppHarbor.studio — aplikacje offline',

  toast_entrySaved: 'Wpis dodany',
  toast_entryUpdated: 'Wpis zaktualizowany',
  toast_entryDeleted: 'Wpis usunięty',
  toast_catAdded: 'Kategoria dodana',
  toast_catDeleted: 'Kategoria usunięta',
  toast_catExists: 'Kategoria już istnieje',
  toast_exported: 'Baza wyeksportowana',
  toast_db_saved_file: 'Baza zapisana w work-journal-db.json',
  toast_export_saved_exchange: (rel) => `Kopia zapisana: ${rel}`,
  toast_import_exchange_missing: (rel) => `Brak pliku ${rel}. Najpierw użyj eksportu.`,
  toast_exported_download: 'Plik pobrany (uruchom aplikację Electron, aby włączyć autozapis)',
  toast_db_save_failed: 'Nie udało się zapisać pliku bazy',
  toast_imported: (n) => `Zaimportowano: ${n} wpisów`,
  toast_cleared: 'Wszystkie dane usunięte',
  toast_badFile: 'Nieprawidłowy format pliku',
  toast_noData: 'Plik nie zawiera wymaganych danych',
  val_date: 'Podaj datę',
  val_desc: 'Wypełnij opis pracy',
  val_catName: 'Podaj nazwę',
  val_report_dates: 'Podaj daty okresu',

  confirm_deleteEntry: 'Usunąć ten wpis?',
  confirm_deleteCat: (name, count) => count > 0
    ? `Kategoria "${name}" jest używana w ${count} wpisach. Usunąć? (Wpisy pozostaną)`
    : `Usunąć kategorię "${name}"?`,
  confirm_import: (e, c) => `Importować ${e} wpisów i ${c} kategorii?\n\nIstniejące dane zostaną ZASTĄPIONE.`,
  confirm_clearAll: 'Usunąć WSZYSTKIE dane? Tej operacji nie można cofnąć!',

  formatDate: (y, m, d) => `${d}.${m}.${y}`,
  headerDate: (date) => {
    return date.toLocaleDateString('pl-PL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  },
  catRecords: (n) => `${n} wpisów`,

  card_issue_found: (d) => `Zgłoszono: ${d}`,
  card_issue_resolved: (d) => `Usunięto usterkę: ${d}`,
  badge_from_issue: 'usterka',
  badge_from_issue_tip: 'Wpis utworzono przy usuwaniu usterki',
  modal_resolveIssue: 'Usunięcie usterki',
  field_resolveDate: 'Data usunięcia (dziennik prac)',
  btn_save_resolve: 'Zapisz w dzienniku',
  issue_resolve_use_list_button: 'Aby zamknąć usterkę, użyj «Usunięto» na liście i wypełnij formularz.',
  issue_reopen_confirm: 'Ponownie otworzyć usterkę? Wpis w dzienniku pozostanie; powiązanie ze statusem zostanie usunięte.',
  issue_resolve_entry_title: (desc) => `Usunięcie: ${desc}`,
  toast_issue_resolved_logged: 'Zapisano w dzienniku prac',
  issue_resolution_section: 'Jak usunięto',
  view_issue_more: 'Szczegóły — usterki',
  view_issue_found_line: (d) => `Zgłoszenie: ${d}`,
  view_issue_resolved_line: (d) => `Usunięcie: ${d}`,

  card_plan_planned_line: (d) => `Plan: ${d}`,
  card_plan_done_line: (d) => `Wykonano: ${d}`,
  badge_from_plan: 'plan',
  badge_from_plan_tip: 'Wpis z wykonanego planu',
  modal_resolvePlan: 'Zakończenie planu',
  field_planRefPeriod: 'Termin w planie',
  field_plan_done_date: 'Data wykonania (dziennik prac)',
  btn_save_plan_resolve: 'Zapisz w dzienniku',
  plan_resolve_use_list_button: 'Aby zakończyć plan, użyj «Wykonane» na liście i wypełnij formularz.',
  plan_reopen_confirm: 'Przywrócić status «Zaplanowano»? Wpis w dzienniku pozostanie; powiązanie zostanie usunięte.',
  plan_resolve_entry_title: (desc) => `Z planu: ${desc}`,
  toast_plan_done_logged: 'Zapisano w dzienniku prac',
  plan_completion_section: 'Jak wykonano',
  view_plan_more: 'Szczegóły — plany',
  view_plan_planned_line: (d) => `Termin: ${d}`,
  view_plan_done_line: (d) => `Wykonano: ${d}`,
};

LANG_PL.nav_archive = 'Archiwum';
LANG_PL.snap_empty_title = 'Archiwum jest puste';
LANG_PL.snap_empty_text = 'Migawki tworzone są automatycznie przed czyszczeniem lub ręcznie';
LANG_PL.snap_empty_nothing = 'Brak danych do zapisania — baza jest pusta';
LANG_PL.snap_created = 'Migawka utworzona';
LANG_PL.snap_restored = 'Baza danych przywrócona z migawki';
LANG_PL.snap_deleted = 'Migawka usunięta';
LANG_PL.snap_notFound = 'Migawka nie znaleziona';
LANG_PL.snap_btn_restore = 'Przywróć';
LANG_PL.snap_btn_download = 'Pobierz jako JSON';
LANG_PL.btn_manualSnap = '📷 Utwórz migawkę';
LANG_PL.snap_reason_manual = 'Ręczna migawka';
LANG_PL.snap_reason_before_clear = 'Przed czyszczeniem';
LANG_PL.snap_reason_before_import = 'Przed importem';
LANG_PL.snap_label_beforeRestore = 'Przed przywróceniem';
LANG_PL.snap_entries = (n) => `${n} wpisów`;
LANG_PL.snap_cats = (n) => `${n} kat.`;
LANG_PL.snap_tasks = (n) => `${n} zadań`;
LANG_PL.snap_confirm_restore = (date, count) =>
  `Przywrócić bazę z migawki z dnia ${date}?\n(${count} wpisów)\n\nBieżący stan zostanie zapisany do archiwum.`;
LANG_PL.snap_confirm_delete = 'Usunąć tę migawkę? Operacji nie można cofnąć.';
LANG_PL.archive_title = 'Archiwum migawek';
LANG_PL.archive_desc = 'Automatyczne i ręczne migawki bazy danych';

LANG_PL.photo_add = 'Dodaj zdjęcie';
LANG_PL.photo_remove = 'Usuń zdjęcie';
LANG_PL.photo_count = (n, max) => `${n} z ${max} zdjęć`;
LANG_PL.photo_limit = `Maksymalnie ${10} zdjęć`;
LANG_PL.photo_limit_trunc = (n) => `Dodano pierwsze ${n} zdjęć (limit osiągnięty)`;
LANG_PL.photo_not_image = 'Plik nie jest obrazem';
LANG_PL.photo_section = 'Zdjęcia';
LANG_PL.photo_link_added = (name) => `Dodano link do zdjęcia. Umieść «${name}» w photos/journal lub photos/issues (lub w photos dla starych wpisów).`;
LANG_PL.btn_view = '👁 Szczegóły';
LANG_PL.view_modal_title = 'Szczegóły wpisu';
LANG_PL.view_edit = 'Edytuj';
LANG_PL.view_actions_label = 'Wykonane czynności';
LANG_PL.view_parts_label = 'Części i materiały';
LANG_PL.view_photos_label = 'Zdjęcia';
LANG_PL.btn_help = '? Pomoc';

LANG_PL.lang_compact = '🇵🇱';

LANG_PL.nav_issues = 'Usterki';
LANG_PL.issues_title = 'Dziennik usterek';
LANG_PL.btn_newIssue = '+ Nowa usterka';
LANG_PL.modal_newIssue = 'Nowa usterka';
LANG_PL.modal_editIssue = 'Edytuj usterkę';
LANG_PL.field_issueDesc = 'Opis usterki';
LANG_PL.field_issueDescPlaceholder = 'Co się zepsuło / gdzie';
LANG_PL.field_issueNotes = 'Notatki / szczegóły';
LANG_PL.field_issueNotesPlaceholder = 'Dodatkowe informacje...';
LANG_PL.field_priority = 'Priorytet';
LANG_PL.field_status = 'Status';
LANG_PL.priority_low = 'Niski';
LANG_PL.priority_medium = 'Średni';
LANG_PL.priority_high = 'Wysoki';
LANG_PL.priority_critical = 'Krytyczny';
LANG_PL.status_open = 'Otwarta';
LANG_PL.status_inprogress = 'W toku';
LANG_PL.status_resolved = 'Rozwiązana';
LANG_PL.empty_issues_title = 'Brak usterek';
LANG_PL.empty_issues_text = 'Kliknij «+ Nowa usterka» aby zarejestrować';
LANG_PL.toast_issueSaved = 'Usterka dodana';
LANG_PL.toast_issueUpdated = 'Usterka zaktualizowana';
LANG_PL.toast_issueDeleted = 'Usterka usunięta';
LANG_PL.confirm_deleteIssue = 'Usunąć ten wpis o usterce?';
LANG_PL.field_dateFound = 'Data wykrycia';
LANG_PL.stat_issues_open = 'Otwarte usterki';

LANG_PL.nav_plans = 'Plany';
LANG_PL.plans_title = 'Planowanie';
LANG_PL.btn_newPlan = '+ Nowy plan';
LANG_PL.modal_newPlan = 'Nowy plan';
LANG_PL.modal_editPlan = 'Edytuj plan';
LANG_PL.field_planDesc = 'Opis zadania';
LANG_PL.field_planDescPlaceholder = 'Co trzeba zrobić';
LANG_PL.field_datePlanned = 'Planowana data';
LANG_PL.field_datePlannedFrom = 'Od';
LANG_PL.field_datePlannedEnd = 'Do';
LANG_PL.field_planPeriodType = 'Okres planu';
LANG_PL.plan_mode_single = 'Jeden dzień';
LANG_PL.plan_mode_range = 'Przedział dat';
LANG_PL.field_planActions = 'Planowane czynności';
LANG_PL.val_plan_range_order = 'Data końcowa nie może być wcześniejsza niż początkowa';
LANG_PL.val_plan_date = 'Podaj planowaną datę';
LANG_PL.val_plan_end_date = 'Podaj datę końcową przedziału';
LANG_PL.field_planActionsPlaceholder = 'Co jest planowane...';
LANG_PL.status_planned = 'Zaplanowane';
LANG_PL.status_done = 'Wykonane';
LANG_PL.empty_plans_title = 'Brak planów';
LANG_PL.empty_plans_text = 'Kliknij «+ Nowy plan» aby dodać zadanie';
LANG_PL.toast_planSaved = 'Plan dodany';
LANG_PL.toast_planUpdated = 'Plan zaktualizowany';
LANG_PL.toast_planDeleted = 'Plan usunięty';
LANG_PL.confirm_deletePlan = 'Usunąć ten plan?';
LANG_PL.plan_mark_done = '✓ Wykonane';
LANG_PL.plan_mark_planned = '↺ Wznów';
LANG_PL.stat_plans_pending = 'Aktywne plany';
LANG_PL.filter_status_all = 'Wszystkie statusy';

// Tasks
LANG_PL.nav_tasks = 'Zadania';
LANG_PL.tasks_title = 'Zadania';
LANG_PL.tasks_search_placeholder = 'Szukaj: zadanie, dopiski, komu przydzielono…';
LANG_PL.tasks_filter_active = 'Aktywne';
LANG_PL.tasks_filter_returned = 'Zwrócone';
LANG_PL.tasks_filter_open = 'Aktywne + zwrócone';
LANG_PL.tasks_filter_completed = 'Zakończone';
LANG_PL.tasks_filter_all = 'Wszystkie';
LANG_PL.tasks_modal_create_title = 'Dodaj do kolejki zadań';
LANG_PL.tasks_modal_append_title = 'Dopisek do zadania';
LANG_PL.tasks_modal_complete_title = 'Zakończenie i zapis do dziennika';
LANG_PL.tasks_field_source = 'Źródło';
LANG_PL.tasks_field_assignees = 'Przydzielono do';
LANG_PL.tasks_field_optional = '(opcjonalnie)';
LANG_PL.tasks_assignees_placeholder = 'np. Kowalski, ekipa nr 2…';
LANG_PL.tasks_field_append = 'Tekst dopisku';
LANG_PL.tasks_val_append = 'Wpisz tekst dopisku';
LANG_PL.tasks_btn_enqueue = 'Dodaj';
LANG_PL.tasks_toast_enqueued = 'Dodano zadanie do kolejki';
LANG_PL.tasks_btn_to_tasks = 'Do zadań';
LANG_PL.tasks_btn_append = 'Dopisz';
LANG_PL.tasks_btn_return = 'Zwróć';
LANG_PL.tasks_queued_chip = 'W kolejce zadań';
LANG_PL.tasks_badge_plan = 'Plan';
LANG_PL.tasks_badge_issue = 'Awaria';
LANG_PL.tasks_status_active = 'Aktywne';
LANG_PL.tasks_status_returned = 'Zwrócone';
LANG_PL.tasks_status_completed = 'Zakończone';
LANG_PL.tasks_status_completed_source = 'Zamknięte z planów/awarii';
LANG_PL.tasks_empty_title = 'Brak zadań';
LANG_PL.tasks_empty_text = 'Użyj „Do zadań” na karcie planu lub awarii';
LANG_PL.tasks_append_saved = 'Dopisek zapisany';
LANG_PL.tasks_sync_append_failed = 'Nie udało się dopisać do planu lub awarii';
LANG_PL.tasks_returned = 'Oznaczono jako zwrócone';
LANG_PL.tasks_completed = 'Zadanie zakończone';
LANG_PL.tasks_completed_linked = 'Zadanie zamknięte: źródło już zapisane w dzienniku';
LANG_PL.tasks_err_active_exists = 'Dla tego źródła jest już aktywne zadanie';
LANG_PL.tasks_err_source_closed = 'Źródło jest już zamknięte — zadanie zostanie zsynchronizowane';
LANG_PL.tasks_err_missing_source = 'Nie znaleziono źródła (może usunięte)';
LANG_PL.tasks_err_double_resolve = 'Już zapisano w dzienniku — zapobiegano podwójnemu zamknięciu';
LANG_PL.tasks_log_title = 'Dopiski';
LANG_PL.tasks_assigned_prefix = 'Przydzielono:';
LANG_PL.tasks_print_title = 'Zadanie';

// Inventory
LANG_PL.nav_inventory = 'Inwentaryzacja';
LANG_PL.inv_title = 'Inwentaryzacja';
LANG_PL.inv_btn_templates = 'Szablony';
LANG_PL.inv_btn_own_template = 'Własny szablon';
LANG_PL.inv_btn_duplicate_template = 'Kopia';
LANG_PL.inv_btn_dictionaries = 'Słowniki';
LANG_PL.inv_btn_back_to_records = '← Do spisów';
LANG_PL.inv_btn_new_record = '+ Nowy spis';
LANG_PL.inv_btn_new_template = '+ Nowy szablon';
LANG_PL.inv_btn_add_field = 'dodaj pole';
LANG_PL.inv_btn_add_item = 'Dodaj pozycję';
LANG_PL.inv_btn_print = 'Drukuj';
LANG_PL.inv_btn_archive = 'Do archiwum';
LANG_PL.inv_btn_restore = 'Przywróć';
LANG_PL.inv_btn_rename = 'Zmień nazwę';
LANG_PL.inv_search_placeholder = 'Szukaj po nazwie spisu...';
LANG_PL.inv_items_search_placeholder = 'Szukaj pozycji...';
LANG_PL.inv_filter_all_templates = 'Wszystkie szablony';
LANG_PL.inv_empty_title = 'Brak spisów';
LANG_PL.inv_empty_text = 'Utwórz pierwszy spis na podstawie szablonu';
LANG_PL.inv_no_items = 'Brak pozycji — kliknij „Dodaj pozycję”';
LANG_PL.inv_record_unnamed = '— bez nazwy —';
LANG_PL.inv_record_template_label = 'Szablon';
LANG_PL.inv_record_date_label = 'Data';
LANG_PL.inv_record_items_label = 'Pozycji';
LANG_PL.inv_record_not_found = 'Spis nie został znaleziony';
LANG_PL.inv_tpl_title = 'Szablony inwentaryzacji';
LANG_PL.inv_tpl_show_archived = 'Pokaż archiwum';
LANG_PL.inv_tpl_empty_title = 'Brak szablonów';
LANG_PL.inv_tpl_empty_text = 'Utwórz pierwszy szablon spisu';
LANG_PL.inv_tpl_unnamed = '— bez nazwy —';
LANG_PL.inv_tpl_unknown = '— szablon nie znaleziony —';
LANG_PL.inv_tpl_fields_label = 'Pola';
LANG_PL.inv_tpl_no_fields = 'Pola nie zostały dodane';
LANG_PL.inv_tpl_empty_editor_hint = 'Brak kolumn. Użyj przycisku «dodaj pole» poniżej: nazwa kolumny i typ (tekst, liczba, lista, data, tak/nie).';
LANG_PL.inv_tpl_badge_archived = 'archiwum';
LANG_PL.inv_modal_template_title = 'Szablon spisu';
LANG_PL.inv_modal_template_new_title = 'Nowy szablon';
LANG_PL.inv_modal_template_edit_title = 'Edycja szablonu';
LANG_PL.inv_modal_new_record_title = 'Nowy spis';
LANG_PL.inv_modal_item_title = 'Pozycja spisu';
LANG_PL.inv_modal_item_add_title = 'Nowa pozycja';
LANG_PL.inv_modal_item_edit_title = 'Edycja pozycji';
LANG_PL.inv_field_template_name = 'Nazwa szablonu';
LANG_PL.inv_field_template_desc = 'Opis (opcjonalnie)';
LANG_PL.inv_field_template_fields = 'Pola';
LANG_PL.inv_field_record_template = 'Szablon';
LANG_PL.inv_field_record_name = 'Nazwa spisu';
LANG_PL.inv_field_record_date = 'Data';
LANG_PL.inv_field_label_placeholder = 'Nazwa pola';
LANG_PL.inv_field_options_label = 'Opcje (rozdzielone przecinkami)';
LANG_PL.inv_field_unit_placeholder = 'jedn.';
LANG_PL.inv_field_required = 'Wymagane';
LANG_PL.inv_field_type_text = 'Tekst';
LANG_PL.inv_field_type_number = 'Liczba';
LANG_PL.inv_field_type_select = 'Lista';
LANG_PL.inv_field_type_date = 'Data';
LANG_PL.inv_field_type_boolean = 'Tak/Nie';
LANG_PL.inv_field_type_multi_select = 'Wielokrotny wybór';
LANG_PL.inv_field_type_composite = 'Numer złożony';
LANG_PL.inv_field_select_source = 'Źródło wartości';
LANG_PL.inv_field_source_options = 'Własna lista';
LANG_PL.inv_field_source_dictionary = 'Słownik';
LANG_PL.inv_field_dictionary_pick = 'Słownik';
LANG_PL.inv_field_unit_mode = 'Jednostka';
LANG_PL.inv_field_unit_none = 'Brak';
LANG_PL.inv_field_unit_free = 'Własna etykieta';
LANG_PL.inv_field_unit_dictionary = 'Ze słownika';
LANG_PL.inv_field_unit_dictionary_short = 'j.';
LANG_PL.inv_field_composite_sep = 'Separator części';
LANG_PL.inv_field_composite_parts = 'Etykiety części';
LANG_PL.inv_field_no_options = 'Brak opcji. Uzupełnij listę w szablonie lub słownik.';
LANG_PL.inv_composite_part_default1 = 'Część 1';
LANG_PL.inv_composite_part_default2 = 'Część 2';
LANG_PL.inv_composite_part_default_short = 'Część';
LANG_PL.inv_composite_add_part = 'część';
LANG_PL.inv_composite_remove_part = 'Usuń część';
LANG_PL.dict_page_title = 'Słowniki';
LANG_PL.dict_page_desc = 'Wbudowane i własne słowniki — wartości dla pól z źródłem «Słownik» lub jednostkami ze słownika.';
LANG_PL.dict_page_hint_custom = 'Własny słownik możesz usunąć czerwonym przyciskiem «Usuń» pod listą wartości. Wbudowanych usunąć nie można.';
LANG_PL.inv_dict_title_storage = 'Miejsca składowania';
LANG_PL.inv_dict_title_units = 'Jednostki miary';
LANG_PL.inv_dict_one_per_line = 'Jedna wartość w wierszu.';
LANG_PL.inv_dict_btn_new = '+ Nowy słownik';
LANG_PL.inv_dict_new_name_prompt = 'Nazwa słownika (jak na listach wyboru):';
LANG_PL.inv_dict_title_label = 'Nazwa na listach';
LANG_PL.inv_dict_slug_label = 'Kod';
LANG_PL.inv_dict_delete = 'Usuń';
LANG_PL.inv_dict_confirm_delete = 'Usunąć ten słownik? Pola szablonów z tym kodem trzeba będzie poprawić ręcznie.';
LANG_PL.inv_dict_system_badge = 'wbudowany';
LANG_PL.inv_field_unit_value_source = 'Źródło jednostek';
LANG_PL.inv_field_unit_options_label = 'Jednostki (przecinkami)';
LANG_PL.inv_toast_dictionary_saved = 'Słownik zapisany';
LANG_PL.inv_toast_dictionary_created = 'Słownik utworzony';
LANG_PL.inv_toast_dictionary_deleted = 'Słownik usunięty';
LANG_PL.inv_toast_item_duplicated = 'Pozycja skopiowana';
LANG_PL.inv_btn_duplicate_item = 'Kopia';
LANG_PL.inv_confirm_remove_field = 'Usunąć to pole z szablonu?';
LANG_PL.inv_confirm_archive_template = 'Przenieść szablon do archiwum? Nie będzie można tworzyć z niego nowych spisów.';
LANG_PL.inv_btn_delete_template = 'Usuń szablon';
LANG_PL.inv_confirm_delete_template = 'Usunąć szablon «{name}»?';
LANG_PL.inv_confirm_delete_template_cascade = 'Usunąć szablon «{name}» i wszystkie powiązane spisy ({n}) wraz z pozycjami? Tej operacji nie cofniesz.';
LANG_PL.inv_toast_template_deleted = 'Szablon usunięty';
LANG_PL.inv_confirm_delete_record = 'Usunąć ten spis wraz ze wszystkimi pozycjami?';
LANG_PL.inv_confirm_delete_item = 'Usunąć tę pozycję?';
LANG_PL.inv_confirm_edit_item = 'Zapisać zmiany pozycji?';
LANG_PL.inv_err_template_name_required = 'Podaj nazwę szablonu';
LANG_PL.inv_err_template_fields_required = 'Dodaj przynajmniej jedno pole';
LANG_PL.inv_err_record_name_required = 'Podaj nazwę spisu';
LANG_PL.inv_err_template_required = 'Wybierz szablon';
LANG_PL.inv_err_template_missing = 'Szablon nie znaleziony';
LANG_PL.inv_err_template_archived = 'Szablon w archiwum — wybierz inny';
LANG_PL.inv_err_no_active_templates = 'Brak aktywnych szablonów — utwórz najpierw szablon';
LANG_PL.inv_err_field_required = 'Pole wymagane:';
LANG_PL.inv_err_popup_blocked = 'Zezwól na wyskakujące okna, aby drukować';
LANG_PL.inv_toast_template_saved = 'Szablon zapisany';
LANG_PL.inv_toast_template_duplicated = 'Utworzono kopię szablonu';
LANG_PL.inv_tpl_copy_suffix = ' (kopia)';
LANG_PL.inv_toast_template_sync_failed = 'Szablon zapisany, ale powiązane spisy nie zostały zaktualizowane (zob. konsolę)';
LANG_PL.inv_toast_template_archived = 'Szablon w archiwum';
LANG_PL.inv_toast_template_restored = 'Szablon przywrócony';
LANG_PL.inv_toast_record_created = 'Spis utworzony';
LANG_PL.inv_toast_record_deleted = 'Spis usunięty';
LANG_PL.inv_toast_record_renamed = 'Nazwa spisu zmieniona';
LANG_PL.inv_toast_item_added = 'Pozycja dodana';
LANG_PL.inv_toast_item_updated = 'Pozycja zaktualizowana';
LANG_PL.inv_toast_item_deleted = 'Pozycja usunięta';
LANG_PL.inv_prompt_rename_record = 'Nowa nazwa spisu:';
LANG_PL.inv_print_date = 'Data';
LANG_PL.inv_default_field_desc = 'Opis';
LANG_PL.inv_default_field_qty = 'Ilość';
LANG_PL.inv_seed_tpl_name = 'Części zamienne (podstawowy)';
LANG_PL.inv_seed_tpl_desc = 'Podstawowy szablon. Można go edytować lub zarchiwizować.';
LANG_PL.inv_seed_field_desc = 'Opis';
LANG_PL.inv_seed_field_part = 'Numer katalogowy';
LANG_PL.inv_seed_field_qty = 'Ilość';
LANG_PL.inv_seed_field_loc = 'Miejsce składowania';
LANG_PL.inv_seed_unit_pcs = 'szt';
LANG_PL.inv_btn_open = 'Otwórz';
LANG_PL.inv_btn_create = 'Utwórz';
LANG_PL.inv_btn_edit_short = 'Edytuj';
LANG_PL.inv_yes = 'Tak';
LANG_PL.inv_no = 'Nie';
