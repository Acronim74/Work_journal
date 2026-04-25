const LANG_EN = {
  code: 'en',
  name: 'English',
  flag: '🇬🇧',

  appTitle: 'WORK.LOG',

  nav_journal: 'Journal',
  nav_categories: 'Categories',
  nav_reports: 'Reports',
  nav_settings: 'Settings',

  stat_total: 'Total entries',
  stat_month: 'This month',
  stat_cats: 'Categories',

  btn_newEntry: '+ New Entry',
  btn_add: '+ Add',
  btn_save: 'Save',
  btn_cancel: 'Cancel',
  btn_edit: 'Edit',
  btn_delete: 'Delete',
  btn_export: '↑ Export',
  btn_import: '↓ Import',
  btn_exportJson: '↑ Download .json',
  btn_importJson: '↓ Load .json',
  btn_clearAll: '🗑 Clear all',
  btn_resetFilters: '✕ Reset',
  btn_addPart: '+ add item',
  btn_generateReport: '⎙ Generate Report',
  btn_print: '🖨 Print',
  btn_closeReport: '✕ Close',
  'theme_toggle:title': 'Toggle theme',

  filter_search: 'Search by description...',
  filter_allCats: 'All categories',
  filter_dateFrom: 'From date',
  filter_dateTo: 'To date',

  modal_newEntry: 'New Entry',
  modal_editEntry: 'Edit Entry',
  field_date: 'Date',
  field_category: 'Category',
  field_catPlaceholder: '— select —',
  field_description: 'Work description',
  field_descPlaceholder: 'Brief description of the task / object',
  field_actions: 'Actions performed',
  field_actionsPlaceholder: 'What was done exactly...',
  field_parts: 'Parts & Materials',
  field_partName: 'Item name',
  field_partQty: 'Qty',

  modal_newCat: 'New Category',
  field_catName: 'Name',
  field_catNamePlaceholder: 'Electrical, Plumbing...',

  card_actions: 'Actions performed',
  card_parts: 'Parts / Materials',

  empty_journal_title: 'No entries yet',
  empty_journal_text: 'Click «New Entry» to add the first one',
  empty_cats_title: 'No categories',
  empty_cats_text: 'Add the first category',
  empty_report_title: 'No data for the selected period',
  empty_report_text: 'Change the date range or category filter',

  report_title: 'Reports',
  report_period_label: 'Period',
  report_period_custom: 'Custom period',
  report_period_week: 'This week',
  report_period_month: 'This month',
  report_period_quarter: 'This quarter',
  report_period_year: 'This year',
  report_cat_filter: 'Categories',
  report_cat_all: 'All categories',
  report_date_from: 'Start date',
  report_date_to: 'End date',
  report_preview_title: 'Preview',
  report_entries_count: (n) => `${n} ${n === 1 ? 'entry' : 'entries'}`,
  report_no_category: 'No category',
  report_doc_title: 'Work Report',
  report_period_text: (from, to) => `Period: ${from} – ${to}`,
  report_generated: (date) => `Generated: ${date}`,
  report_total_entries: (n) => `Total entries: ${n}`,
  report_section_actions: 'Actions performed:',
  report_section_parts: 'Materials used:',
  report_tab_journal: 'Work log',
  report_tab_issues: 'Issues',
  report_tab_plans: 'Plans',
  report_doc_issues: 'Issues report',
  report_doc_plans: 'Plans report',
  report_total_issues: (n) => `Total records: ${n}`,
  report_total_plans: (n) => `Total plans: ${n}`,
  empty_report_issues_title: 'No issues in this period',
  empty_report_issues_text: 'Change dates or category filter',
  empty_report_plans_title: 'No plans in this period',
  empty_report_plans_text: 'Change dates or category filter',
  report_section_notes: 'Notes:',
  report_plan_dates_label: 'Planned:',

  settings_electron_db_desc: 'Live mirror: work-journal-db.json next to the app. Transfer backup: journal-exchange folder.',
  settings_export_label: 'Export database',
  settings_export_desc: 'Desktop: writes journal-exchange/work-journal-backup.json. Browser: downloads JSON.',
  settings_import_label: 'Import database',
  settings_import_desc: 'Desktop: reads journal-exchange/work-journal-backup.json. Browser: pick a file.',
  settings_clear_label: 'Clear all data',
  settings_clear_desc: 'Delete all entries and categories (irreversible!)',
  settings_lang_label: 'Interface language',
  settings_lang_desc: 'UI language (data is not affected)',
  settings_about_title: 'About',
  settings_about_text: 'Work Journal v1.1\nDatabase: IndexedDB (local, in browser)\nNo data is sent to the internet\nUse export/import to transfer data',

  toast_entrySaved: 'Entry added',
  toast_entryUpdated: 'Entry updated',
  toast_entryDeleted: 'Entry deleted',
  toast_catAdded: 'Category added',
  toast_catDeleted: 'Category deleted',
  toast_catExists: 'Category already exists',
  toast_exported: 'Database exported',
  toast_db_saved_file: 'Database saved to work-journal-db.json',
  toast_export_saved_exchange: (rel) => `Copy saved: ${rel}`,
  toast_import_exchange_missing: (rel) => `Missing ${rel}. Use Export first.`,
  toast_exported_download: 'File downloaded (use the Electron app for automatic saving)',
  toast_db_save_failed: 'Could not save the database file',
  toast_imported: (n) => `Imported: ${n} entries`,
  toast_cleared: 'All data cleared',
  toast_badFile: 'Invalid file format',
  toast_noData: 'File does not contain required data',
  val_date: 'Please specify a date',
  val_desc: 'Please fill in the work description',
  val_catName: 'Please enter a name',
  val_report_dates: 'Please specify the period dates',

  confirm_deleteEntry: 'Delete this entry?',
  confirm_deleteCat: (name, count) => count > 0
    ? `Category "${name}" is used in ${count} entries. Delete? (Entries will remain)`
    : `Delete category "${name}"?`,
  confirm_import: (e, c) => `Import ${e} entries and ${c} categories?\n\nExisting data will be REPLACED.`,
  confirm_clearAll: 'Delete ALL data? This action is irreversible!',

  formatDate: (y, m, d) => `${m}/${d}/${y}`,
  headerDate: (date) => {
    return date.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  },
  catRecords: (n) => `${n} rec.`,

  card_issue_found: (d) => `Reported: ${d}`,
  card_issue_resolved: (d) => `Resolved: ${d}`,
  badge_from_issue: 'from issue',
  badge_from_issue_tip: 'Entry created when an issue was resolved',
  modal_resolveIssue: 'Resolve issue',
  field_resolveDate: 'Resolution date (work log)',
  btn_save_resolve: 'Save to work log',
  issue_resolve_use_list_button: 'Use «Resolved» in the list and fill in the resolution form to close an issue.',
  issue_reopen_confirm: 'Reopen this issue? The work log entry will stay; the link to “resolved” will be cleared.',
  issue_resolve_entry_title: (desc) => `Resolution: ${desc}`,
  toast_issue_resolved_logged: 'Saved to work log',
  issue_resolution_section: 'Resolution',
  view_issue_more: 'Details — issues',
  view_issue_found_line: (d) => `Reported: ${d}`,
  view_issue_resolved_line: (d) => `Resolved: ${d}`,

  card_plan_planned_line: (d) => `Planned: ${d}`,
  card_plan_done_line: (d) => `Completed: ${d}`,
  badge_from_plan: 'plan',
  badge_from_plan_tip: 'Entry from a completed plan',
  modal_resolvePlan: 'Complete plan',
  field_planRefPeriod: 'Planned period',
  field_plan_done_date: 'Completion date (work log)',
  btn_save_plan_resolve: 'Save to work log',
  plan_resolve_use_list_button: 'Use «Mark done» in the plan list and fill in the form to complete a plan.',
  plan_reopen_confirm: 'Reopen as planned? The work log entry stays; the link to «done» will be cleared.',
  plan_resolve_entry_title: (desc) => `Plan: ${desc}`,
  toast_plan_done_logged: 'Saved to work log',
  plan_completion_section: 'How it was done',
  view_plan_more: 'Details — plans',
  view_plan_planned_line: (d) => `Planned: ${d}`,
  view_plan_done_line: (d) => `Done: ${d}`,
};

LANG_EN.nav_archive = 'Archive';
LANG_EN.snap_empty_title = 'Archive is empty';
LANG_EN.snap_empty_text = 'Snapshots are created automatically before clearing, or manually';
LANG_EN.snap_empty_nothing = 'Nothing to save — database is empty';
LANG_EN.snap_created = 'Snapshot created';
LANG_EN.snap_restored = 'Database restored from snapshot';
LANG_EN.snap_deleted = 'Snapshot deleted';
LANG_EN.snap_notFound = 'Snapshot not found';
LANG_EN.snap_btn_restore = 'Restore';
LANG_EN.snap_btn_download = 'Download as JSON';
LANG_EN.btn_manualSnap = '📷 Create snapshot';
LANG_EN.snap_reason_manual = 'Manual snapshot';
LANG_EN.snap_reason_before_clear = 'Before clear';
LANG_EN.snap_reason_before_import = 'Before import';
LANG_EN.snap_label_beforeRestore = 'Before restore';
LANG_EN.snap_entries = (n) => `${n} entr.`;
LANG_EN.snap_cats = (n) => `${n} cat.`;
LANG_EN.snap_tasks = (n) => `${n} tasks`;
LANG_EN.snap_confirm_restore = (date, count) =>
  `Restore database from snapshot dated ${date}?\n(${count} entries)\n\nCurrent state will be saved to archive.`;
LANG_EN.snap_confirm_delete = 'Delete this snapshot? This cannot be undone.';
LANG_EN.archive_title = 'Snapshot Archive';
LANG_EN.archive_desc = 'Automatic and manual database snapshots';

LANG_EN.photo_add = 'Add photo';
LANG_EN.photo_remove = 'Remove photo';
LANG_EN.photo_count = (n, max) => `${n} of ${max} photos`;
LANG_EN.photo_limit = `Maximum ${10} photos`;
LANG_EN.photo_limit_trunc = (n) => `Added first ${n} photos (limit reached)`;
LANG_EN.photo_not_image = 'Not an image file';
LANG_EN.photo_section = 'Photos';
LANG_EN.photo_link_added = (name) => `Photo link added. Put «${name}» in photos/journal or photos/issues (or photos root for legacy entries).`;
LANG_EN.btn_view = '👁 Details';
LANG_EN.view_modal_title = 'Entry Details';
LANG_EN.view_edit = 'Edit';
LANG_EN.view_actions_label = 'Actions performed';
LANG_EN.view_parts_label = 'Parts & Materials';
LANG_EN.view_photos_label = 'Photos';
LANG_EN.btn_help = '? Help';

LANG_EN.lang_compact = '🇬🇧';

LANG_EN.nav_issues = 'Issues';
LANG_EN.issues_title = 'Issue Log';
LANG_EN.btn_newIssue = '+ New Issue';
LANG_EN.modal_newIssue = 'New Issue';
LANG_EN.modal_editIssue = 'Edit Issue';
LANG_EN.field_issueDesc = 'Issue description';
LANG_EN.field_issueDescPlaceholder = 'What broke / where';
LANG_EN.field_issueNotes = 'Notes / details';
LANG_EN.field_issueNotesPlaceholder = 'Additional information...';
LANG_EN.field_priority = 'Priority';
LANG_EN.field_status = 'Status';
LANG_EN.priority_low = 'Low';
LANG_EN.priority_medium = 'Medium';
LANG_EN.priority_high = 'High';
LANG_EN.priority_critical = 'Critical';
LANG_EN.status_open = 'Open';
LANG_EN.status_inprogress = 'In Progress';
LANG_EN.status_resolved = 'Resolved';
LANG_EN.empty_issues_title = 'No issues';
LANG_EN.empty_issues_text = 'Click «+ New Issue» to log one';
LANG_EN.toast_issueSaved = 'Issue added';
LANG_EN.toast_issueUpdated = 'Issue updated';
LANG_EN.toast_issueDeleted = 'Issue deleted';
LANG_EN.confirm_deleteIssue = 'Delete this issue?';
LANG_EN.field_dateFound = 'Date found';
LANG_EN.stat_issues_open = 'Open issues';

LANG_EN.nav_plans = 'Plans';
LANG_EN.plans_title = 'Planning';
LANG_EN.btn_newPlan = '+ New Plan';
LANG_EN.modal_newPlan = 'New Plan';
LANG_EN.modal_editPlan = 'Edit Plan';
LANG_EN.field_planDesc = 'Task description';
LANG_EN.field_planDescPlaceholder = 'What needs to be done';
LANG_EN.field_datePlanned = 'Planned date';
LANG_EN.field_datePlannedFrom = 'From';
LANG_EN.field_datePlannedEnd = 'To';
LANG_EN.field_planPeriodType = 'Plan timeframe';
LANG_EN.plan_mode_single = 'Single day';
LANG_EN.plan_mode_range = 'Date range';
LANG_EN.field_planActions = 'Planned actions';
LANG_EN.val_plan_range_order = 'End date cannot be before start date';
LANG_EN.val_plan_date = 'Please set the planned date';
LANG_EN.val_plan_end_date = 'Please set the end date of the range';
LANG_EN.field_planActionsPlaceholder = 'What is planned...';
LANG_EN.status_planned = 'Planned';
LANG_EN.status_done = 'Done';
LANG_EN.empty_plans_title = 'No plans';
LANG_EN.empty_plans_text = 'Click «+ New Plan» to add a task';
LANG_EN.toast_planSaved = 'Plan added';
LANG_EN.toast_planUpdated = 'Plan updated';
LANG_EN.toast_planDeleted = 'Plan deleted';
LANG_EN.confirm_deletePlan = 'Delete this plan?';
LANG_EN.plan_mark_done = '✓ Mark done';
LANG_EN.plan_mark_planned = '↺ Reopen';
LANG_EN.stat_plans_pending = 'Active plans';
LANG_EN.filter_status_all = 'All statuses';

// Tasks
LANG_EN.nav_tasks = 'Tasks';
LANG_EN.tasks_title = 'Tasks';
LANG_EN.tasks_search_placeholder = 'Search tasks, append notes, assignees…';
LANG_EN.tasks_filter_active = 'Active';
LANG_EN.tasks_filter_returned = 'Returned';
LANG_EN.tasks_filter_open = 'Active + returned';
LANG_EN.tasks_filter_completed = 'Completed';
LANG_EN.tasks_filter_all = 'All';
LANG_EN.tasks_modal_create_title = 'Add to task queue';
LANG_EN.tasks_modal_append_title = 'Append note';
LANG_EN.tasks_modal_complete_title = 'Complete and log to journal';
LANG_EN.tasks_field_source = 'Source';
LANG_EN.tasks_field_assignees = 'Assigned to';
LANG_EN.tasks_field_optional = '(optional)';
LANG_EN.tasks_assignees_placeholder = 'e.g. John, crew #2…';
LANG_EN.tasks_field_append = 'Append text';
LANG_EN.tasks_val_append = 'Enter append text';
LANG_EN.tasks_btn_enqueue = 'Add';
LANG_EN.tasks_toast_enqueued = 'Task added to the queue';
LANG_EN.tasks_btn_to_tasks = 'To tasks';
LANG_EN.tasks_btn_append = 'Append';
LANG_EN.tasks_btn_return = 'Return';
LANG_EN.tasks_queued_chip = 'In task queue';
LANG_EN.tasks_badge_plan = 'Plan';
LANG_EN.tasks_badge_issue = 'Issue';
LANG_EN.tasks_status_active = 'Active';
LANG_EN.tasks_status_returned = 'Returned';
LANG_EN.tasks_status_completed = 'Completed';
LANG_EN.tasks_status_completed_source = 'Closed from plans/issues';
LANG_EN.tasks_empty_title = 'No tasks';
LANG_EN.tasks_empty_text = 'Use “To tasks” on a plan or issue card';
LANG_EN.tasks_append_saved = 'Append saved';
LANG_EN.tasks_sync_append_failed = 'Could not write append to plan or issue';
LANG_EN.tasks_returned = 'Marked as returned';
LANG_EN.tasks_completed = 'Task completed';
LANG_EN.tasks_completed_linked = 'Task closed: source already logged in journal';
LANG_EN.tasks_err_active_exists = 'This source already has an active task';
LANG_EN.tasks_err_source_closed = 'Source is already closed — task will sync';
LANG_EN.tasks_err_missing_source = 'Source not found (maybe deleted)';
LANG_EN.tasks_err_double_resolve = 'Already logged — duplicate close prevented';
LANG_EN.tasks_log_title = 'Append log';
LANG_EN.tasks_assigned_prefix = 'Assigned:';
LANG_EN.tasks_print_title = 'Task';

// Inventory
LANG_EN.nav_inventory = 'Inventory';
LANG_EN.inv_title = 'Inventory';
LANG_EN.inv_btn_templates = 'Templates';
LANG_EN.inv_btn_back_to_records = '← Back to records';
LANG_EN.inv_btn_new_record = '+ New record';
LANG_EN.inv_btn_new_template = '+ New template';
LANG_EN.inv_btn_add_field = 'add field';
LANG_EN.inv_btn_add_item = 'Add item';
LANG_EN.inv_btn_print = 'Print';
LANG_EN.inv_btn_archive = 'Archive';
LANG_EN.inv_btn_restore = 'Restore';
LANG_EN.inv_btn_rename = 'Rename';
LANG_EN.inv_search_placeholder = 'Search by record name...';
LANG_EN.inv_items_search_placeholder = 'Search items...';
LANG_EN.inv_filter_all_templates = 'All templates';
LANG_EN.inv_empty_title = 'No records yet';
LANG_EN.inv_empty_text = 'Create the first record from a template';
LANG_EN.inv_no_items = 'No items — click "Add item"';
LANG_EN.inv_record_unnamed = '— untitled —';
LANG_EN.inv_record_template_label = 'Template';
LANG_EN.inv_record_date_label = 'Date';
LANG_EN.inv_record_items_label = 'Items';
LANG_EN.inv_record_not_found = 'Record not found';
LANG_EN.inv_tpl_title = 'Inventory templates';
LANG_EN.inv_tpl_show_archived = 'Show archived';
LANG_EN.inv_tpl_empty_title = 'No templates';
LANG_EN.inv_tpl_empty_text = 'Create the first inventory template';
LANG_EN.inv_tpl_unnamed = '— untitled —';
LANG_EN.inv_tpl_unknown = '— template not found —';
LANG_EN.inv_tpl_fields_label = 'Fields';
LANG_EN.inv_tpl_no_fields = 'No fields added';
LANG_EN.inv_tpl_badge_archived = 'archived';
LANG_EN.inv_modal_template_title = 'Inventory template';
LANG_EN.inv_modal_template_new_title = 'New template';
LANG_EN.inv_modal_template_edit_title = 'Edit template';
LANG_EN.inv_modal_new_record_title = 'New record';
LANG_EN.inv_modal_item_title = 'Inventory item';
LANG_EN.inv_modal_item_add_title = 'New item';
LANG_EN.inv_modal_item_edit_title = 'Edit item';
LANG_EN.inv_field_template_name = 'Template name';
LANG_EN.inv_field_template_desc = 'Description (optional)';
LANG_EN.inv_field_template_fields = 'Fields';
LANG_EN.inv_field_record_template = 'Template';
LANG_EN.inv_field_record_name = 'Record name';
LANG_EN.inv_field_record_date = 'Date';
LANG_EN.inv_field_label_placeholder = 'Field name';
LANG_EN.inv_field_options_label = 'Options (comma-separated)';
LANG_EN.inv_field_unit_placeholder = 'unit';
LANG_EN.inv_field_required = 'Required';
LANG_EN.inv_field_type_text = 'Text';
LANG_EN.inv_field_type_number = 'Number';
LANG_EN.inv_field_type_select = 'Select';
LANG_EN.inv_field_type_date = 'Date';
LANG_EN.inv_field_type_boolean = 'Yes/No';
LANG_EN.inv_confirm_remove_field = 'Remove this field from the template?';
LANG_EN.inv_confirm_archive_template = 'Move template to archive? You will not be able to create new records from it.';
LANG_EN.inv_confirm_delete_record = 'Delete this record with all items?';
LANG_EN.inv_confirm_delete_item = 'Delete this item?';
LANG_EN.inv_confirm_edit_item = 'Save changes to this item?';
LANG_EN.inv_err_template_name_required = 'Template name is required';
LANG_EN.inv_err_template_fields_required = 'Add at least one field';
LANG_EN.inv_err_record_name_required = 'Record name is required';
LANG_EN.inv_err_template_required = 'Choose a template';
LANG_EN.inv_err_template_missing = 'Template not found';
LANG_EN.inv_err_template_archived = 'Template is archived — choose another';
LANG_EN.inv_err_no_active_templates = 'No active templates — create one first';
LANG_EN.inv_err_field_required = 'Required field:';
LANG_EN.inv_err_popup_blocked = 'Allow pop-ups to print';
LANG_EN.inv_toast_template_saved = 'Template saved';
LANG_EN.inv_toast_template_archived = 'Template archived';
LANG_EN.inv_toast_template_restored = 'Template restored';
LANG_EN.inv_toast_record_created = 'Record created';
LANG_EN.inv_toast_record_deleted = 'Record deleted';
LANG_EN.inv_toast_record_renamed = 'Record renamed';
LANG_EN.inv_toast_item_added = 'Item added';
LANG_EN.inv_toast_item_updated = 'Item updated';
LANG_EN.inv_toast_item_deleted = 'Item deleted';
LANG_EN.inv_prompt_rename_record = 'New record name:';
LANG_EN.inv_print_date = 'Date';
LANG_EN.inv_default_field_desc = 'Description';
LANG_EN.inv_default_field_qty = 'Quantity';
LANG_EN.inv_seed_tpl_name = 'Spare parts (basic)';
LANG_EN.inv_seed_tpl_desc = 'Basic template. You can edit or archive it.';
LANG_EN.inv_seed_field_desc = 'Description';
LANG_EN.inv_seed_field_part = 'Catalog number';
LANG_EN.inv_seed_field_qty = 'Quantity';
LANG_EN.inv_seed_field_loc = 'Storage location';
LANG_EN.inv_seed_unit_pcs = 'pcs';
LANG_EN.inv_btn_open = 'Open';
LANG_EN.inv_btn_create = 'Create';
LANG_EN.inv_btn_edit_short = 'Edit';
LANG_EN.inv_yes = 'Yes';
LANG_EN.inv_no = 'No';
