const LANG_RO = {
  code: 'ro',
  name: 'Română',
  flag: '🇷🇴',

  appTitle: 'WORK.LOG',

  nav_journal: 'Jurnal',
  nav_categories: 'Categorii',
  nav_reports: 'Rapoarte',
  nav_settings: 'Setări',

  stat_total: 'Total înregistrări',
  stat_month: 'Luna aceasta',
  stat_cats: 'Categorii',

  btn_newEntry: '+ Înregistrare nouă',
  btn_add: '+ Adaugă',
  btn_save: 'Salvează',
  btn_cancel: 'Anulează',
  btn_edit: 'Editează',
  btn_delete: 'Șterge',
  btn_export: '↑ Export',
  btn_import: '↓ Import',
  btn_exportJson: '↑ Descarcă .json',
  btn_importJson: '↓ Încarcă .json',
  btn_clearAll: '🗑 Șterge tot',
  btn_resetFilters: '✕ Resetează',
  btn_addPart: '+ adaugă poziție',
  btn_generateReport: '⎙ Generează raport',
  btn_print: '🖨 Tipărește',
  btn_closeReport: '✕ Închide',
  'theme_toggle:title': 'Comută tema',

  filter_search: 'Caută în descriere...',
  filter_allCats: 'Toate categoriile',
  filter_dateFrom: 'De la data',
  filter_dateTo: 'Până la data',

  modal_newEntry: 'Înregistrare nouă',
  modal_editEntry: 'Editează înregistrarea',
  field_date: 'Data',
  field_category: 'Categorie',
  field_catPlaceholder: '— alege —',
  field_description: 'Descrierea lucrării',
  field_descPlaceholder: 'Scurtă descriere a sarcinii / obiectului',
  field_actions: 'Acțiuni efectuate',
  field_actionsPlaceholder: 'Ce s-a făcut exact...',
  field_parts: 'Piese și materiale',
  field_partName: 'Denumire',
  field_partQty: 'Cant.',

  modal_newCat: 'Categorie nouă',
  field_catName: 'Nume',
  field_catNamePlaceholder: 'Electric, Instalații...',

  card_actions: 'Acțiuni efectuate',
  card_parts: 'Piese / materiale',

  empty_journal_title: 'Încă nu există înregistrări',
  empty_journal_text: 'Apasă «Înregistrare nouă» pentru prima',
  empty_cats_title: 'Nu există categorii',
  empty_cats_text: 'Adaugă prima categorie',
  empty_report_title: 'Nu există date pentru perioada aleasă',
  empty_report_text: 'Schimbă intervalul sau filtrul de categorie',

  report_title: 'Rapoarte',
  report_period_label: 'Perioadă',
  report_period_custom: 'Perioadă personalizată',
  report_period_week: 'Săptămâna aceasta',
  report_period_month: 'Luna aceasta',
  report_period_quarter: 'Trimestrul acesta',
  report_period_year: 'Anul acesta',
  report_cat_filter: 'Categorii',
  report_cat_all: 'Toate categoriile',
  report_date_from: 'Data început',
  report_date_to: 'Data sfârșit',
  report_preview_title: 'Previzualizare',
  report_entries_count: (n) => `${n} ${n === 1 ? 'înregistrare' : 'înregistrări'}`,
  report_no_category: 'Fără categorie',
  report_doc_title: 'Raport de lucru',
  report_period_text: (from, to) => `Perioadă: ${from} – ${to}`,
  report_generated: (date) => `Generat: ${date}`,
  report_total_entries: (n) => `Total înregistrări: ${n}`,
  report_section_actions: 'Acțiuni efectuate:',
  report_section_parts: 'Materiale folosite:',
  report_tab_journal: 'Jurnal lucru',
  report_tab_issues: 'Defecțiuni',
  report_tab_plans: 'Planuri',
  report_doc_issues: 'Raport defecțiuni',
  report_doc_plans: 'Raport planuri',
  report_total_issues: (n) => `Total înregistrări: ${n}`,
  report_total_plans: (n) => `Total planuri: ${n}`,
  empty_report_issues_title: 'Nu există defecțiuni în această perioadă',
  empty_report_issues_text: 'Schimbă datele sau filtrul de categorie',
  empty_report_plans_title: 'Nu există planuri în această perioadă',
  empty_report_plans_text: 'Schimbă datele sau filtrul de categorie',
  report_section_notes: 'Note:',
  report_plan_dates_label: 'Planificate:',

  settings_electron_db_desc: 'Oglindă live: work-journal-db.json lângă aplicație. Transfer backup: dosarul journal-exchange.',
  settings_export_label: 'Exportă baza de date',
  settings_export_desc: 'Desktop: scrie journal-exchange/work-journal-backup.json. Browser: descarcă JSON.',
  settings_import_label: 'Importă baza de date',
  settings_import_desc: 'Desktop: citește journal-exchange/work-journal-backup.json. Browser: alege fișier.',
  settings_clear_label: 'Șterge toate datele',
  settings_clear_desc: 'Șterge toate înregistrările și categoriile (ireversibil!)',
  settings_lang_label: 'Limba interfeței',
  settings_lang_desc: 'Limba UI (datele nu se schimbă)',
  settings_about_title: 'Despre',
  settings_about_text: 'Work Journal v1.1\nBază de date: IndexedDB (local, în browser)\nNu se trimit date pe internet\nFolosește export/import pentru transfer',
  settings_copyright_line: '© AppHarbor.studio — studio de aplicații offline.',
  sidebar_copyright_line: '© AppHarbor.studio — aplicații offline',

  toast_entrySaved: 'Înregistrare adăugată',
  toast_entryUpdated: 'Înregistrare actualizată',
  toast_entryDeleted: 'Înregistrare ștearsă',
  toast_catAdded: 'Categorie adăugată',
  toast_catDeleted: 'Categorie ștearsă',
  toast_catExists: 'Categoria există deja',
  toast_exported: 'Baza exportată',
  toast_db_saved_file: 'Baza salvată în work-journal-db.json',
  toast_export_saved_exchange: (rel) => `Copie salvată: ${rel}`,
  toast_import_exchange_missing: (rel) => `Lipsește ${rel}. Folosește mai întâi Export.`,
  toast_exported_download: 'Fișier descărcat (aplicația Electron salvează automat)',
  toast_db_save_failed: 'Nu s-a putut salva fișierul bazei de date',
  toast_imported: (n) => `Importate: ${n} înregistrări`,
  toast_cleared: 'Toate datele au fost șterse',
  toast_badFile: 'Format fișier nevalid',
  toast_noData: 'Fișierul nu conține datele necesare',
  val_date: 'Indică data',
  val_desc: 'Completează descrierea lucrării',
  val_catName: 'Introdu un nume',
  val_report_dates: 'Indică datele perioadei',

  confirm_deleteEntry: 'Ștergi această înregistrare?',
  confirm_deleteCat: (name, count) => count > 0
    ? `Categoria „${name}” este folosită în ${count} înregistrări. Ștergi? (Înregistrările rămân)`
    : `Ștergi categoria „${name}”?`,
  confirm_import: (e, c) => `Import ${e} înregistrări și ${c} categorii?\n\nDatele existente vor fi ÎNLOCUITE.`,
  confirm_clearAll: 'Ștergi TOATE datele? Acțiunea este ireversibilă!',

  formatDate: (y, m, d) => `${d}.${m}.${y}`,
  headerDate: (date) => {
    return date.toLocaleDateString('ro-RO', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  },
  catRecords: (n) => `${n} înr.`,

  card_issue_found: (d) => `Raportat: ${d}`,
  card_issue_resolved: (d) => `Rezolvat: ${d}`,
  badge_from_issue: 'din defecțiune',
  badge_from_issue_tip: 'Înregistrare creată la rezolvarea unei defecțiuni',
  modal_resolveIssue: 'Rezolvă defecțiunea',
  field_resolveDate: 'Data rezolvării (jurnal lucru)',
  btn_save_resolve: 'Salvează în jurnal',
  issue_resolve_use_list_button: 'Folosește «Rezolvat» în listă și completează formularul pentru a închide defecțiunea.',
  issue_reopen_confirm: 'Redeschizi defecțiunea? Înregistrarea din jurnal rămâne; legătura la „rezolvat” se șterge.',
  issue_resolve_entry_title: (desc) => `Rezolvare: ${desc}`,
  toast_issue_resolved_logged: 'Salvat în jurnal',
  issue_resolution_section: 'Rezolvare',
  view_issue_more: 'Detalii — defecțiuni',
  view_issue_found_line: (d) => `Raportat: ${d}`,
  view_issue_resolved_line: (d) => `Rezolvat: ${d}`,

  card_plan_planned_line: (d) => `Planificat: ${d}`,
  card_plan_done_line: (d) => `Finalizat: ${d}`,
  badge_from_plan: 'plan',
  badge_from_plan_tip: 'Înregistrare dintr-un plan finalizat',
  modal_resolvePlan: 'Finalizează planul',
  field_planRefPeriod: 'Perioada planificată',
  field_plan_done_date: 'Data finalizării (jurnal lucru)',
  btn_save_plan_resolve: 'Salvează în jurnal',
  plan_resolve_use_list_button: 'Folosește «Marchează finalizat» în lista de planuri și completează formularul.',
  plan_reopen_confirm: 'Redeschizi ca planificat? Înregistrarea din jurnal rămâne; legătura la «finalizat» se șterge.',
  plan_resolve_entry_title: (desc) => `Plan: ${desc}`,
  toast_plan_done_logged: 'Salvat în jurnal',
  plan_completion_section: 'Cum s-a realizat',
  view_plan_more: 'Detalii — planuri',
  view_plan_planned_line: (d) => `Planificat: ${d}`,
  view_plan_done_line: (d) => `Gata: ${d}`,
};

LANG_RO.nav_archive = 'Arhivă';
LANG_RO.snap_empty_title = 'Arhiva este goală';
LANG_RO.snap_empty_text = 'Instantanee create automat înainte de golire sau manual';
LANG_RO.snap_empty_nothing = 'Nimic de salvat — baza este goală';
LANG_RO.snap_created = 'Instantaneu creat';
LANG_RO.snap_restored = 'Baza restaurată din instantaneu';
LANG_RO.snap_deleted = 'Instantaneu șters';
LANG_RO.snap_notFound = 'Instantaneu negăsit';
LANG_RO.snap_btn_restore = 'Restaurează';
LANG_RO.snap_btn_download = 'Descarcă JSON';
LANG_RO.btn_manualSnap = '📷 Creează instantaneu';
LANG_RO.snap_reason_manual = 'Instantaneu manual';
LANG_RO.snap_reason_before_clear = 'Înainte de golire';
LANG_RO.snap_reason_before_import = 'Înainte de import';
LANG_RO.snap_label_beforeRestore = 'Înainte de restaurare';
LANG_RO.snap_entries = (n) => `${n} înr.`;
LANG_RO.snap_cats = (n) => `${n} cat.`;
LANG_RO.snap_tasks = (n) => `${n} sarcini`;
LANG_RO.snap_confirm_restore = (date, count) =>
  `Restaurezi baza din instantaneul din ${date}?\n(${count} înregistrări)\n\nStarea curentă va fi salvată în arhivă.`;
LANG_RO.snap_confirm_delete = 'Ștergi acest instantaneu? Nu se poate anula.';
LANG_RO.archive_title = 'Arhivă instantanee';
LANG_RO.archive_desc = 'Instantanee automate și manuale ale bazei de date';

LANG_RO.photo_add = 'Adaugă fotografie';
LANG_RO.photo_remove = 'Elimină fotografia';
LANG_RO.photo_count = (n, max) => `${n} din ${max} fotografii`;
LANG_RO.photo_limit = `Maximum ${10} fotografii`;
LANG_RO.photo_limit_trunc = (n) => `Adăugate primele ${n} fotografii (limită atinsă)`;
LANG_RO.photo_not_image = 'Fișierul nu este imagine';
LANG_RO.photo_section = 'Fotografii';
LANG_RO.photo_link_added = (name) => `Legătură foto adăugată. Pune «${name}» în photos/journal sau photos/issues (sau rădăina photos pentru înregistrări vechi).`;
LANG_RO.btn_view = '👁 Detalii';
LANG_RO.view_modal_title = 'Detalii înregistrare';
LANG_RO.view_edit = 'Editează';
LANG_RO.view_actions_label = 'Acțiuni efectuate';
LANG_RO.view_parts_label = 'Piese și materiale';
LANG_RO.view_photos_label = 'Fotografii';
LANG_RO.btn_help = '? Ajutor';

LANG_RO.lang_compact = '🇷🇴';

LANG_RO.nav_issues = 'Defecțiuni';
LANG_RO.issues_title = 'Jurnal defecțiuni';
LANG_RO.btn_newIssue = '+ Defecțiune nouă';
LANG_RO.modal_newIssue = 'Defecțiune nouă';
LANG_RO.modal_editIssue = 'Editează defecțiunea';
LANG_RO.field_issueDesc = 'Descrierea defecțiunii';
LANG_RO.field_issueDescPlaceholder = 'Ce s-a stricat / unde';
LANG_RO.field_issueNotes = 'Note / detalii';
LANG_RO.field_issueNotesPlaceholder = 'Informații suplimentare...';
LANG_RO.field_priority = 'Prioritate';
LANG_RO.field_status = 'Stare';
LANG_RO.priority_low = 'Scăzută';
LANG_RO.priority_medium = 'Medie';
LANG_RO.priority_high = 'Ridicată';
LANG_RO.priority_critical = 'Critică';
LANG_RO.status_open = 'Deschisă';
LANG_RO.status_inprogress = 'În lucru';
LANG_RO.status_resolved = 'Rezolvată';
LANG_RO.empty_issues_title = 'Nu există defecțiuni';
LANG_RO.empty_issues_text = 'Apasă «+ Defecțiune nouă» pentru a înregistra';
LANG_RO.toast_issueSaved = 'Defecțiune adăugată';
LANG_RO.toast_issueUpdated = 'Defecțiune actualizată';
LANG_RO.toast_issueDeleted = 'Defecțiune ștearsă';
LANG_RO.confirm_deleteIssue = 'Ștergi această defecțiune?';
LANG_RO.field_dateFound = 'Data constatării';
LANG_RO.stat_issues_open = 'Defecțiuni deschise';

LANG_RO.nav_plans = 'Planuri';
LANG_RO.plans_title = 'Planificare';
LANG_RO.btn_newPlan = '+ Plan nou';
LANG_RO.modal_newPlan = 'Plan nou';
LANG_RO.modal_editPlan = 'Editează planul';
LANG_RO.field_planDesc = 'Descrierea sarcinii';
LANG_RO.field_planDescPlaceholder = 'Ce trebuie făcut';
LANG_RO.field_datePlanned = 'Data planificată';
LANG_RO.field_datePlannedFrom = 'De la';
LANG_RO.field_datePlannedEnd = 'Până la';
LANG_RO.field_planPeriodType = 'Interval plan';
LANG_RO.plan_mode_single = 'O zi';
LANG_RO.plan_mode_range = 'Interval de date';
LANG_RO.field_planActions = 'Acțiuni planificate';
LANG_RO.val_plan_range_order = 'Data de sfârșit nu poate fi înaintea celei de început';
LANG_RO.val_plan_date = 'Setează data planificată';
LANG_RO.val_plan_end_date = 'Setează data de sfârșit a intervalului';
LANG_RO.field_planActionsPlaceholder = 'Ce este planificat...';
LANG_RO.status_planned = 'Planificat';
LANG_RO.status_done = 'Finalizat';
LANG_RO.empty_plans_title = 'Nu există planuri';
LANG_RO.empty_plans_text = 'Apasă «+ Plan nou» pentru a adăuga o sarcină';
LANG_RO.toast_planSaved = 'Plan adăugat';
LANG_RO.toast_planUpdated = 'Plan actualizat';
LANG_RO.toast_planDeleted = 'Plan șters';
LANG_RO.confirm_deletePlan = 'Ștergi acest plan?';
LANG_RO.plan_mark_done = '✓ Marchează finalizat';
LANG_RO.plan_mark_planned = '↺ Redeschide';
LANG_RO.stat_plans_pending = 'Planuri active';
LANG_RO.filter_status_all = 'Toate stările';

LANG_RO.nav_tasks = 'Sarcini';
LANG_RO.tasks_title = 'Sarcini';
LANG_RO.tasks_search_placeholder = 'Caută sarcini, note adăugate, responsabili…';
LANG_RO.tasks_filter_active = 'Active';
LANG_RO.tasks_filter_returned = 'Returnate';
LANG_RO.tasks_filter_open = 'Active + returnate';
LANG_RO.tasks_filter_completed = 'Finalizate';
LANG_RO.tasks_filter_all = 'Toate';
LANG_RO.tasks_modal_create_title = 'Adaugă la coada de sarcini';
LANG_RO.tasks_modal_append_title = 'Adaugă notă';
LANG_RO.tasks_modal_complete_title = 'Finalizează și salvează în jurnal';
LANG_RO.tasks_field_source = 'Sursă';
LANG_RO.tasks_field_assignees = 'Atribuit lui';
LANG_RO.tasks_field_optional = '(opțional)';
LANG_RO.tasks_assignees_placeholder = 'ex.: Ion, echipa nr. 2…';
LANG_RO.tasks_field_append = 'Text adăugat';
LANG_RO.tasks_val_append = 'Introdu textul adăugat';
LANG_RO.tasks_btn_enqueue = 'Adaugă';
LANG_RO.tasks_toast_enqueued = 'Sarcină adăugată la coadă';
LANG_RO.tasks_btn_to_tasks = 'La sarcini';
LANG_RO.tasks_btn_append = 'Adaugă';
LANG_RO.tasks_btn_return = 'Returnează';
LANG_RO.tasks_queued_chip = 'În coada de sarcini';
LANG_RO.tasks_badge_plan = 'Plan';
LANG_RO.tasks_badge_issue = 'Defecțiune';
LANG_RO.tasks_status_active = 'Activă';
LANG_RO.tasks_status_returned = 'Returnată';
LANG_RO.tasks_status_completed = 'Finalizată';
LANG_RO.tasks_status_completed_source = 'Închisă din planuri/defecțiuni';
LANG_RO.tasks_empty_title = 'Nu există sarcini';
LANG_RO.tasks_empty_text = 'Folosește „La sarcini” pe o carte de plan sau defecțiune';
LANG_RO.tasks_append_saved = 'Notă salvată';
LANG_RO.tasks_sync_append_failed = 'Nu s-a putut scrie adăugarea la plan sau defecțiune';
LANG_RO.tasks_returned = 'Marcată ca returnată';
LANG_RO.tasks_completed = 'Sarcină finalizată';
LANG_RO.tasks_completed_linked = 'Sarcină închisă: sursa e deja în jurnal';
LANG_RO.tasks_err_active_exists = 'Această sursă are deja o sarcină activă';
LANG_RO.tasks_err_source_closed = 'Sursa este deja închisă — sarcina se va sincroniza';
LANG_RO.tasks_err_missing_source = 'Sursă negăsită (poate ștearsă)';
LANG_RO.tasks_err_double_resolve = 'Deja înregistrat — închidere dublă blocată';
LANG_RO.tasks_log_title = 'Jurnal adăugări';
LANG_RO.tasks_assigned_prefix = 'Atribuit:';
LANG_RO.tasks_print_title = 'Sarcină';

LANG_RO.nav_inventory = 'Inventar';
LANG_RO.inv_title = 'Inventar';
LANG_RO.inv_btn_templates = 'Șabloane';
LANG_RO.inv_btn_own_template = 'Șablon personalizat';
LANG_RO.inv_btn_duplicate_template = 'Duplicat';
LANG_RO.inv_btn_dictionaries = 'Dicționare';
LANG_RO.inv_btn_back_to_records = '← Înapoi la registre';
LANG_RO.inv_btn_new_record = '+ Registru nou';
LANG_RO.inv_btn_new_template = '+ Șablon nou';
LANG_RO.inv_btn_add_field = 'adaugă câmp';
LANG_RO.inv_btn_add_item = 'Adaugă poziție';
LANG_RO.inv_btn_print = 'Tipărește';
LANG_RO.inv_btn_archive = 'Arhivă';
LANG_RO.inv_btn_restore = 'Restaurează';
LANG_RO.inv_btn_rename = 'Redenumește';
LANG_RO.inv_search_placeholder = 'Caută după numele registrului...';
LANG_RO.inv_items_search_placeholder = 'Caută poziții...';
LANG_RO.inv_filter_all_templates = 'Toate șabloanele';
LANG_RO.inv_empty_title = 'Încă nu există registre';
LANG_RO.inv_empty_text = 'Creează primul registru dintr-un șablon';
LANG_RO.inv_no_items = 'Nu există poziții — apasă „Adaugă poziție”';
LANG_RO.inv_record_unnamed = '— fără titlu —';
LANG_RO.inv_record_template_label = 'Șablon';
LANG_RO.inv_record_date_label = 'Data';
LANG_RO.inv_record_items_label = 'Poziții';
LANG_RO.inv_record_not_found = 'Registru negăsit';
LANG_RO.inv_tpl_title = 'Șabloane inventar';
LANG_RO.inv_tpl_show_archived = 'Arată arhivate';
LANG_RO.inv_tpl_empty_title = 'Nu există șabloane';
LANG_RO.inv_tpl_empty_text = 'Creează primul șablon de inventar';
LANG_RO.inv_tpl_unnamed = '— fără titlu —';
LANG_RO.inv_tpl_unknown = '— șablon negăsit —';
LANG_RO.inv_tpl_fields_label = 'Câmpuri';
LANG_RO.inv_tpl_no_fields = 'Nu există câmpuri adăugate';
LANG_RO.inv_tpl_empty_editor_hint = 'Încă nu există coloane. Folosește «adaugă câmp» mai jos: titlul coloanei și tipul (text, număr, listă, dată, da/nu).';
LANG_RO.inv_tpl_badge_archived = 'arhivat';
LANG_RO.inv_modal_template_title = 'Șablon inventar';
LANG_RO.inv_modal_template_new_title = 'Șablon nou';
LANG_RO.inv_modal_template_edit_title = 'Editează șablonul';
LANG_RO.inv_modal_new_record_title = 'Registru nou';
LANG_RO.inv_modal_item_title = 'Poziție inventar';
LANG_RO.inv_modal_item_add_title = 'Poziție nouă';
LANG_RO.inv_modal_item_edit_title = 'Editează poziția';
LANG_RO.inv_field_template_name = 'Numele șablonului';
LANG_RO.inv_field_template_desc = 'Descriere (opțional)';
LANG_RO.inv_field_template_fields = 'Câmpuri';
LANG_RO.inv_field_record_template = 'Șablon';
LANG_RO.inv_field_record_name = 'Numele registrului';
LANG_RO.inv_field_record_date = 'Data';
LANG_RO.inv_field_label_placeholder = 'Nume câmp';
LANG_RO.inv_field_options_label = 'Opțiuni (separate prin virgulă)';
LANG_RO.inv_field_unit_placeholder = 'unit.';
LANG_RO.inv_field_required = 'Obligatoriu';
LANG_RO.inv_field_type_text = 'Text';
LANG_RO.inv_field_type_number = 'Număr';
LANG_RO.inv_field_type_select = 'Listă';
LANG_RO.inv_field_type_date = 'Dată';
LANG_RO.inv_field_type_boolean = 'Da/Nu';
LANG_RO.inv_field_type_multi_select = 'Selecție multiplă';
LANG_RO.inv_field_type_composite = 'ID compus';
LANG_RO.inv_field_select_source = 'Sursa valorilor';
LANG_RO.inv_field_source_options = 'Listă proprie';
LANG_RO.inv_field_source_dictionary = 'Dicționar';
LANG_RO.inv_field_dictionary_pick = 'Dicționar';
LANG_RO.inv_field_unit_mode = 'Unitate';
LANG_RO.inv_field_unit_none = 'Fără';
LANG_RO.inv_field_unit_free = 'Etichetă proprie';
LANG_RO.inv_field_unit_dictionary = 'Din dicționar';
LANG_RO.inv_field_unit_dictionary_short = 'u.m.';
LANG_RO.inv_field_composite_sep = 'Separator părți';
LANG_RO.inv_field_composite_parts = 'Etichete părți';
LANG_RO.inv_field_no_options = 'Fără opțiuni. Setează lista în șablon sau completează dicționarul.';
LANG_RO.inv_composite_part_default1 = 'Partea 1';
LANG_RO.inv_composite_part_default2 = 'Partea 2';
LANG_RO.inv_composite_part_default_short = 'Parte';
LANG_RO.inv_composite_add_part = 'parte';
LANG_RO.inv_composite_remove_part = 'Elimină partea';
LANG_RO.dict_page_title = 'Dicționare';
LANG_RO.dict_page_desc = 'Dicționare integrate și proprii — valori pentru câmpuri cu sursa «Dicționar» sau unități din dicționar.';
LANG_RO.dict_page_hint_custom = 'Un dicționar propriu poate fi șters cu butonul roșu «Șterge» sub lista de valori. Pe cele integrate nu le poți șterge.';
LANG_RO.inv_dict_title_storage = 'Locații de depozitare';
LANG_RO.inv_dict_title_units = 'Unități de măsură';
LANG_RO.inv_dict_one_per_line = 'O valoare pe linie.';
LANG_RO.inv_dict_btn_new = '+ Dicționar nou';
LANG_RO.inv_dict_new_name_prompt = 'Numele dicționarului (ca în liste):';
LANG_RO.inv_dict_title_label = 'Nume afișat';
LANG_RO.inv_dict_slug_label = 'Cod';
LANG_RO.inv_dict_delete = 'Șterge';
LANG_RO.inv_dict_confirm_delete = 'Ștergi acest dicționar? Va trebui să corectezi manual câmpurile din șabloane care îl folosesc.';
LANG_RO.inv_dict_system_badge = 'integrat';
LANG_RO.inv_field_unit_value_source = 'Sursă unități';
LANG_RO.inv_field_unit_options_label = 'Unități (separate prin virgulă)';
LANG_RO.inv_toast_dictionary_saved = 'Dicționar salvat';
LANG_RO.inv_toast_dictionary_created = 'Dicționar creat';
LANG_RO.inv_toast_dictionary_deleted = 'Dicționar șters';
LANG_RO.inv_toast_item_duplicated = 'Poziție duplicată';
LANG_RO.inv_btn_duplicate_item = 'Duplicat';
LANG_RO.inv_confirm_remove_field = 'Elimini acest câmp din șablon?';
LANG_RO.inv_confirm_archive_template = 'Muți șablonul în arhivă? Nu vei putea crea registre noi din el.';
LANG_RO.inv_btn_delete_template = 'Șterge șablonul';
LANG_RO.inv_confirm_delete_template = 'Ștergi șablonul «{name}»?';
LANG_RO.inv_confirm_delete_template_cascade = 'Ștergi șablonul «{name}» și toate registrele care îl folosesc ({n}) cu toate pozițiile? Acțiunea e ireversibilă.';
LANG_RO.inv_toast_template_deleted = 'Șablon șters';
LANG_RO.inv_confirm_delete_record = 'Ștergi acest registru cu toate pozițiile?';
LANG_RO.inv_confirm_delete_item = 'Ștergi această poziție?';
LANG_RO.inv_confirm_edit_item = 'Salvezi modificările acestei poziții?';
LANG_RO.inv_err_template_name_required = 'Numele șablonului este obligatoriu';
LANG_RO.inv_err_template_fields_required = 'Adaugă cel puțin un câmp';
LANG_RO.inv_err_record_name_required = 'Numele registrului este obligatoriu';
LANG_RO.inv_err_template_required = 'Alege un șablon';
LANG_RO.inv_err_template_missing = 'Șablon negăsit';
LANG_RO.inv_err_template_archived = 'Șablonul este arhivat — alege altul';
LANG_RO.inv_err_no_active_templates = 'Nu există șabloane active — creează unul mai întâi';
LANG_RO.inv_err_field_required = 'Câmp obligatoriu:';
LANG_RO.inv_err_popup_blocked = 'Permite ferestrele pop-up pentru tipărire';
LANG_RO.inv_toast_template_saved = 'Șablon salvat';
LANG_RO.inv_toast_template_duplicated = 'Șablon duplicat';
LANG_RO.inv_tpl_copy_suffix = ' (copie)';
LANG_RO.inv_toast_template_sync_failed = 'Șablon salvat, dar registrele legate nu au putut fi actualizate (vezi consola)';
LANG_RO.inv_toast_template_archived = 'Șablon arhivat';
LANG_RO.inv_toast_template_restored = 'Șablon restaurat';
LANG_RO.inv_toast_record_created = 'Registru creat';
LANG_RO.inv_toast_record_deleted = 'Registru șters';
LANG_RO.inv_toast_record_renamed = 'Registru redenumit';
LANG_RO.inv_toast_item_added = 'Poziție adăugată';
LANG_RO.inv_toast_item_updated = 'Poziție actualizată';
LANG_RO.inv_toast_item_deleted = 'Poziție ștearsă';
LANG_RO.inv_prompt_rename_record = 'Nume nou registru:';
LANG_RO.inv_print_date = 'Data';
LANG_RO.inv_default_field_desc = 'Descriere';
LANG_RO.inv_default_field_qty = 'Cantitate';
LANG_RO.inv_seed_tpl_name = 'Piese de schimb (de bază)';
LANG_RO.inv_seed_tpl_desc = 'Șablon de bază. Poți edita sau arhiva.';
LANG_RO.inv_seed_field_desc = 'Descriere';
LANG_RO.inv_seed_field_part = 'Număr catalog';
LANG_RO.inv_seed_field_qty = 'Cantitate';
LANG_RO.inv_seed_field_loc = 'Locație depozitare';
LANG_RO.inv_seed_unit_pcs = 'buc';
LANG_RO.inv_btn_open = 'Deschide';
LANG_RO.inv_btn_create = 'Creează';
LANG_RO.inv_btn_edit_short = 'Ed.';
LANG_RO.inv_yes = 'Da';
LANG_RO.inv_no = 'Nu';
