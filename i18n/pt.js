const LANG_PT = {
  code: 'pt',
  name: 'Português (BR)',
  flag: '🇧🇷',

  appTitle: 'WORK.LOG',

  nav_journal: 'Diário',
  nav_categories: 'Categorias',
  nav_reports: 'Relatórios',
  nav_settings: 'Configurações',

  stat_total: 'Total de registros',
  stat_month: 'Este mês',
  stat_cats: 'Categorias',

  btn_newEntry: '+ Novo registro',
  btn_add: '+ Adicionar',
  btn_save: 'Salvar',
  btn_cancel: 'Cancelar',
  btn_edit: 'Editar',
  btn_delete: 'Excluir',
  btn_export: '↑ Exportar',
  btn_import: '↓ Importar',
  btn_exportJson: '↑ Baixar .json',
  btn_importJson: '↓ Carregar .json',
  btn_clearAll: '🗑 Limpar tudo',
  btn_resetFilters: '✕ Redefinir',
  btn_addPart: '+ adicionar item',
  btn_generateReport: '⎙ Gerar relatório',
  btn_print: '🖨 Imprimir',
  btn_closeReport: '✕ Fechar',
  'theme_toggle:title': 'Alternar tema',

  filter_search: 'Buscar na descrição...',
  filter_allCats: 'Todas as categorias',
  filter_dateFrom: 'Data inicial',
  filter_dateTo: 'Data final',

  modal_newEntry: 'Novo registro',
  modal_editEntry: 'Editar registro',
  field_date: 'Data',
  field_category: 'Categoria',
  field_catPlaceholder: '— selecione —',
  field_description: 'Descrição do trabalho',
  field_descPlaceholder: 'Breve descrição da tarefa / objeto',
  field_actions: 'Ações realizadas',
  field_actionsPlaceholder: 'O que foi feito exatamente...',
  field_parts: 'Peças e materiais',
  field_partName: 'Nome do item',
  field_partQty: 'Qtd',

  modal_newCat: 'Nova categoria',
  field_catName: 'Nome',
  field_catNamePlaceholder: 'Elétrica, Hidráulica...',

  card_actions: 'Ações realizadas',
  card_parts: 'Peças / materiais',

  empty_journal_title: 'Ainda não há registros',
  empty_journal_text: 'Clique em «Novo registro» para adicionar o primeiro',
  empty_cats_title: 'Sem categorias',
  empty_cats_text: 'Adicione a primeira categoria',
  empty_report_title: 'Sem dados no período selecionado',
  empty_report_text: 'Altere o intervalo de datas ou o filtro de categoria',

  report_title: 'Relatórios',
  report_period_label: 'Período',
  report_period_custom: 'Período personalizado',
  report_period_week: 'Esta semana',
  report_period_month: 'Este mês',
  report_period_quarter: 'Este trimestre',
  report_period_year: 'Este ano',
  report_cat_filter: 'Categorias',
  report_cat_all: 'Todas as categorias',
  report_date_from: 'Data inicial',
  report_date_to: 'Data final',
  report_preview_title: 'Pré-visualização',
  report_entries_count: (n) => `${n} ${n === 1 ? 'registro' : 'registros'}`,
  report_no_category: 'Sem categoria',
  report_doc_title: 'Relatório de trabalho',
  report_period_text: (from, to) => `Período: ${from} – ${to}`,
  report_generated: (date) => `Gerado: ${date}`,
  report_total_entries: (n) => `Total de registros: ${n}`,
  report_section_actions: 'Ações realizadas:',
  report_section_parts: 'Materiais utilizados:',
  report_tab_journal: 'Diário de trabalho',
  report_tab_issues: 'Problemas',
  report_tab_plans: 'Planos',
  report_doc_issues: 'Relatório de problemas',
  report_doc_plans: 'Relatório de planos',
  report_total_issues: (n) => `Total de registros: ${n}`,
  report_total_plans: (n) => `Total de planos: ${n}`,
  empty_report_issues_title: 'Sem problemas neste período',
  empty_report_issues_text: 'Altere as datas ou o filtro de categoria',
  empty_report_plans_title: 'Sem planos neste período',
  empty_report_plans_text: 'Altere as datas ou o filtro de categoria',
  report_section_notes: 'Notas:',
  report_plan_dates_label: 'Planejado:',

  settings_electron_db_desc: 'Espelho ao vivo: work-journal-db.json ao lado do app. Backup de transferência: pasta journal-exchange.',
  settings_export_label: 'Exportar banco de dados',
  settings_export_desc: 'Desktop: grava journal-exchange/work-journal-backup.json. Navegador: baixa JSON.',
  settings_import_label: 'Importar banco de dados',
  settings_import_desc: 'Desktop: lê journal-exchange/work-journal-backup.json. Navegador: escolha um arquivo.',
  settings_clear_label: 'Limpar todos os dados',
  settings_clear_desc: 'Excluir todos os registros e categorias (irreversível!)',
  settings_lang_label: 'Idioma da interface',
  settings_lang_desc: 'Idioma da UI (os dados não são alterados)',
  settings_about_title: 'Sobre',
  settings_about_text: 'Work Journal v1.1\nBanco: IndexedDB (local, no navegador)\nNenhum dado é enviado à internet\nUse exportar/importar para transferir dados',
  settings_copyright_line: '© AppHarbor.studio — estúdio de aplicações offline.',
  sidebar_copyright_line: '© AppHarbor.studio — apps offline',

  toast_entrySaved: 'Registro adicionado',
  toast_entryUpdated: 'Registro atualizado',
  toast_entryDeleted: 'Registro excluído',
  toast_catAdded: 'Categoria adicionada',
  toast_catDeleted: 'Categoria excluída',
  toast_catExists: 'Categoria já existe',
  toast_exported: 'Banco exportado',
  toast_db_saved_file: 'Banco salvo em work-journal-db.json',
  toast_export_saved_exchange: (rel) => `Cópia salva: ${rel}`,
  toast_import_exchange_missing: (rel) => `Falta ${rel}. Exporte primeiro.`,
  toast_exported_download: 'Arquivo baixado (use o app Electron para salvar automaticamente)',
  toast_db_save_failed: 'Não foi possível salvar o arquivo do banco',
  toast_imported: (n) => `Importados: ${n} registros`,
  toast_cleared: 'Todos os dados foram limpos',
  toast_badFile: 'Formato de arquivo inválido',
  toast_noData: 'O arquivo não contém os dados necessários',
  val_date: 'Informe a data',
  val_desc: 'Preencha a descrição do trabalho',
  val_catName: 'Informe um nome',
  val_report_dates: 'Informe as datas do período',

  confirm_deleteEntry: 'Excluir este registro?',
  confirm_deleteCat: (name, count) => count > 0
    ? `A categoria «${name}» é usada em ${count} registros. Excluir? (Os registros permanecem)`
    : `Excluir categoria «${name}»?`,
  confirm_import: (e, c) => `Importar ${e} registros e ${c} categorias?\n\nOs dados existentes serão SUBSTITUÍDOS.`,
  confirm_clearAll: 'Excluir TODOS os dados? Esta ação é irreversível!',

  formatDate: (y, m, d) => `${d}/${m}/${y}`,
  headerDate: (date) => {
    return date.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  },
  catRecords: (n) => `${n} reg.`,

  card_issue_found: (d) => `Registrado: ${d}`,
  card_issue_resolved: (d) => `Resolvido: ${d}`,
  badge_from_issue: 'de problema',
  badge_from_issue_tip: 'Registro criado quando um problema foi resolvido',
  modal_resolveIssue: 'Resolver problema',
  field_resolveDate: 'Data da resolução (diário)',
  btn_save_resolve: 'Salvar no diário',
  issue_resolve_use_list_button: 'Use «Resolvido» na lista e preencha o formulário para fechar o problema.',
  issue_reopen_confirm: 'Reabrir este problema? O registro no diário permanece; o vínculo com «resolvido» será limpo.',
  issue_resolve_entry_title: (desc) => `Resolução: ${desc}`,
  toast_issue_resolved_logged: 'Salvo no diário',
  issue_resolution_section: 'Resolução',
  view_issue_more: 'Detalhes — problemas',
  view_issue_found_line: (d) => `Registrado: ${d}`,
  view_issue_resolved_line: (d) => `Resolvido: ${d}`,

  card_plan_planned_line: (d) => `Planejado: ${d}`,
  card_plan_done_line: (d) => `Concluído: ${d}`,
  badge_from_plan: 'plano',
  badge_from_plan_tip: 'Registro de um plano concluído',
  modal_resolvePlan: 'Concluir plano',
  field_planRefPeriod: 'Período planejado',
  field_plan_done_date: 'Data de conclusão (diário)',
  btn_save_plan_resolve: 'Salvar no diário',
  plan_resolve_use_list_button: 'Use «Marcar concluído» na lista de planos e preencha o formulário.',
  plan_reopen_confirm: 'Reabrir como planejado? O registro no diário permanece; o vínculo com «concluído» será limpo.',
  plan_resolve_entry_title: (desc) => `Plano: ${desc}`,
  toast_plan_done_logged: 'Salvo no diário',
  plan_completion_section: 'Como foi feito',
  view_plan_more: 'Detalhes — planos',
  view_plan_planned_line: (d) => `Planejado: ${d}`,
  view_plan_done_line: (d) => `Feito: ${d}`,
};

LANG_PT.nav_archive = 'Arquivo';
LANG_PT.snap_empty_title = 'O arquivo está vazio';
LANG_PT.snap_empty_text = 'Instantâneos são criados automaticamente antes de limpar, ou manualmente';
LANG_PT.snap_empty_nothing = 'Nada a salvar — banco vazio';
LANG_PT.snap_created = 'Instantâneo criado';
LANG_PT.snap_restored = 'Banco restaurado do instantâneo';
LANG_PT.snap_deleted = 'Instantâneo excluído';
LANG_PT.snap_notFound = 'Instantâneo não encontrado';
LANG_PT.snap_btn_restore = 'Restaurar';
LANG_PT.snap_btn_download = 'Baixar JSON';
LANG_PT.btn_manualSnap = '📷 Criar instantâneo';
LANG_PT.snap_reason_manual = 'Instantâneo manual';
LANG_PT.snap_reason_before_clear = 'Antes de limpar';
LANG_PT.snap_reason_before_import = 'Antes de importar';
LANG_PT.snap_label_beforeRestore = 'Antes de restaurar';
LANG_PT.snap_entries = (n) => `${n} reg.`;
LANG_PT.snap_cats = (n) => `${n} cat.`;
LANG_PT.snap_tasks = (n) => `${n} tarefas`;
LANG_PT.snap_confirm_restore = (date, count) =>
  `Restaurar banco do instantâneo de ${date}?\n(${count} registros)\n\nO estado atual será salvo no arquivo.`;
LANG_PT.snap_confirm_delete = 'Excluir este instantâneo? Não pode ser desfeito.';
LANG_PT.archive_title = 'Arquivo de instantâneos';
LANG_PT.archive_desc = 'Instantâneos automáticos e manuais do banco';

LANG_PT.photo_add = 'Adicionar foto';
LANG_PT.photo_remove = 'Remover foto';
LANG_PT.photo_count = (n, max) => `${n} de ${max} fotos`;
LANG_PT.photo_limit = `Máximo ${10} fotos`;
LANG_PT.photo_limit_trunc = (n) => `Adicionadas as primeiras ${n} fotos (limite atingido)`;
LANG_PT.photo_not_image = 'Arquivo não é imagem';
LANG_PT.photo_section = 'Fotos';
LANG_PT.photo_link_added = (name) => `Link da foto adicionado. Coloque «${name}» em photos/journal ou photos/issues (ou raiz photos para registros antigos).`;
LANG_PT.btn_view = '👁 Detalhes';
LANG_PT.view_modal_title = 'Detalhes do registro';
LANG_PT.view_edit = 'Editar';
LANG_PT.view_actions_label = 'Ações realizadas';
LANG_PT.view_parts_label = 'Peças e materiais';
LANG_PT.view_photos_label = 'Fotos';
LANG_PT.btn_help = '? Ajuda';

LANG_PT.lang_compact = '🇧🇷';

LANG_PT.nav_issues = 'Problemas';
LANG_PT.issues_title = 'Registro de problemas';
LANG_PT.btn_newIssue = '+ Novo problema';
LANG_PT.modal_newIssue = 'Novo problema';
LANG_PT.modal_editIssue = 'Editar problema';
LANG_PT.field_issueDesc = 'Descrição do problema';
LANG_PT.field_issueDescPlaceholder = 'O que quebrou / onde';
LANG_PT.field_issueNotes = 'Notas / detalhes';
LANG_PT.field_issueNotesPlaceholder = 'Informações adicionais...';
LANG_PT.field_priority = 'Prioridade';
LANG_PT.field_status = 'Status';
LANG_PT.priority_low = 'Baixa';
LANG_PT.priority_medium = 'Média';
LANG_PT.priority_high = 'Alta';
LANG_PT.priority_critical = 'Crítica';
LANG_PT.status_open = 'Aberto';
LANG_PT.status_inprogress = 'Em andamento';
LANG_PT.status_resolved = 'Resolvido';
LANG_PT.empty_issues_title = 'Sem problemas';
LANG_PT.empty_issues_text = 'Clique em «+ Novo problema» para registrar';
LANG_PT.toast_issueSaved = 'Problema adicionado';
LANG_PT.toast_issueUpdated = 'Problema atualizado';
LANG_PT.toast_issueDeleted = 'Problema excluído';
LANG_PT.confirm_deleteIssue = 'Excluir este problema?';
LANG_PT.field_dateFound = 'Data constatada';
LANG_PT.stat_issues_open = 'Problemas abertos';

LANG_PT.nav_plans = 'Planos';
LANG_PT.plans_title = 'Planejamento';
LANG_PT.btn_newPlan = '+ Novo plano';
LANG_PT.modal_newPlan = 'Novo plano';
LANG_PT.modal_editPlan = 'Editar plano';
LANG_PT.field_planDesc = 'Descrição da tarefa';
LANG_PT.field_planDescPlaceholder = 'O que precisa ser feito';
LANG_PT.field_datePlanned = 'Data planejada';
LANG_PT.field_datePlannedFrom = 'De';
LANG_PT.field_datePlannedEnd = 'Até';
LANG_PT.field_planPeriodType = 'Período do plano';
LANG_PT.plan_mode_single = 'Um dia';
LANG_PT.plan_mode_range = 'Intervalo de datas';
LANG_PT.field_planActions = 'Ações planejadas';
LANG_PT.val_plan_range_order = 'A data final não pode ser anterior à inicial';
LANG_PT.val_plan_date = 'Defina a data planejada';
LANG_PT.val_plan_end_date = 'Defina a data final do intervalo';
LANG_PT.field_planActionsPlaceholder = 'O que está planejado...';
LANG_PT.status_planned = 'Planejado';
LANG_PT.status_done = 'Concluído';
LANG_PT.empty_plans_title = 'Sem planos';
LANG_PT.empty_plans_text = 'Clique em «+ Novo plano» para adicionar uma tarefa';
LANG_PT.toast_planSaved = 'Plano adicionado';
LANG_PT.toast_planUpdated = 'Plano atualizado';
LANG_PT.toast_planDeleted = 'Plano excluído';
LANG_PT.confirm_deletePlan = 'Excluir este plano?';
LANG_PT.plan_mark_done = '✓ Marcar concluído';
LANG_PT.plan_mark_planned = '↺ Reabrir';
LANG_PT.stat_plans_pending = 'Planos ativos';
LANG_PT.filter_status_all = 'Todos os status';

LANG_PT.nav_tasks = 'Tarefas';
LANG_PT.tasks_title = 'Tarefas';
LANG_PT.tasks_search_placeholder = 'Buscar tarefas, notas, responsáveis…';
LANG_PT.tasks_filter_active = 'Ativas';
LANG_PT.tasks_filter_returned = 'Devolvidas';
LANG_PT.tasks_filter_open = 'Ativas + devolvidas';
LANG_PT.tasks_filter_completed = 'Concluídas';
LANG_PT.tasks_filter_all = 'Todas';
LANG_PT.tasks_modal_create_title = 'Adicionar à fila de tarefas';
LANG_PT.tasks_modal_append_title = 'Acrescentar nota';
LANG_PT.tasks_modal_complete_title = 'Concluir e registrar no diário';
LANG_PT.tasks_field_source = 'Origem';
LANG_PT.tasks_field_assignees = 'Atribuído a';
LANG_PT.tasks_field_optional = '(opcional)';
LANG_PT.tasks_assignees_placeholder = 'ex.: João, equipe nº 2…';
LANG_PT.tasks_field_append = 'Texto da nota';
LANG_PT.tasks_val_append = 'Digite o texto da nota';
LANG_PT.tasks_btn_enqueue = 'Adicionar';
LANG_PT.tasks_toast_enqueued = 'Tarefa adicionada à fila';
LANG_PT.tasks_btn_to_tasks = 'Para tarefas';
LANG_PT.tasks_btn_append = 'Acrescentar';
LANG_PT.tasks_btn_return = 'Devolver';
LANG_PT.tasks_queued_chip = 'Na fila de tarefas';
LANG_PT.tasks_badge_plan = 'Plano';
LANG_PT.tasks_badge_issue = 'Problema';
LANG_PT.tasks_status_active = 'Ativa';
LANG_PT.tasks_status_returned = 'Devolvida';
LANG_PT.tasks_status_completed = 'Concluída';
LANG_PT.tasks_status_completed_source = 'Fechada a partir de planos/problemas';
LANG_PT.tasks_empty_title = 'Sem tarefas';
LANG_PT.tasks_empty_text = 'Use «Para tarefas» no cartão de plano ou problema';
LANG_PT.tasks_append_saved = 'Nota salva';
LANG_PT.tasks_sync_append_failed = 'Não foi possível gravar a nota no plano ou problema';
LANG_PT.tasks_returned = 'Marcada como devolvida';
LANG_PT.tasks_completed = 'Tarefa concluída';
LANG_PT.tasks_completed_linked = 'Tarefa fechada: origem já registrada no diário';
LANG_PT.tasks_err_active_exists = 'Esta origem já tem uma tarefa ativa';
LANG_PT.tasks_err_source_closed = 'A origem já está fechada — a tarefa será sincronizada';
LANG_PT.tasks_err_missing_source = 'Origem não encontrada (talvez excluída)';
LANG_PT.tasks_err_double_resolve = 'Já registrado — fechamento duplicado impedido';
LANG_PT.tasks_log_title = 'Log de notas';
LANG_PT.tasks_assigned_prefix = 'Atribuído:';
LANG_PT.tasks_print_title = 'Tarefa';

LANG_PT.nav_inventory = 'Inventário';
LANG_PT.inv_title = 'Inventário';
LANG_PT.inv_btn_templates = 'Modelos';
LANG_PT.inv_btn_own_template = 'Modelo personalizado';
LANG_PT.inv_btn_duplicate_template = 'Duplicar';
LANG_PT.inv_btn_dictionaries = 'Dicionários';
LANG_PT.inv_btn_back_to_records = '← Voltar aos registros';
LANG_PT.inv_btn_new_record = '+ Novo registro';
LANG_PT.inv_btn_new_template = '+ Novo modelo';
LANG_PT.inv_btn_add_field = 'adicionar campo';
LANG_PT.inv_btn_add_item = 'Adicionar item';
LANG_PT.inv_btn_print = 'Imprimir';
LANG_PT.inv_btn_archive = 'Arquivar';
LANG_PT.inv_btn_restore = 'Restaurar';
LANG_PT.inv_btn_rename = 'Renomear';
LANG_PT.inv_search_placeholder = 'Buscar pelo nome do registro...';
LANG_PT.inv_items_search_placeholder = 'Buscar itens...';
LANG_PT.inv_filter_all_templates = 'Todos os modelos';
LANG_PT.inv_empty_title = 'Ainda não há registros';
LANG_PT.inv_empty_text = 'Crie o primeiro registro a partir de um modelo';
LANG_PT.inv_no_items = 'Sem itens — clique em «Adicionar item»';
LANG_PT.inv_record_unnamed = '— sem título —';
LANG_PT.inv_record_template_label = 'Modelo';
LANG_PT.inv_record_date_label = 'Data';
LANG_PT.inv_record_items_label = 'Itens';
LANG_PT.inv_record_not_found = 'Registro não encontrado';
LANG_PT.inv_tpl_title = 'Modelos de inventário';
LANG_PT.inv_tpl_show_archived = 'Mostrar arquivados';
LANG_PT.inv_tpl_empty_title = 'Sem modelos';
LANG_PT.inv_tpl_empty_text = 'Crie o primeiro modelo de inventário';
LANG_PT.inv_tpl_unnamed = '— sem título —';
LANG_PT.inv_tpl_unknown = '— modelo não encontrado —';
LANG_PT.inv_tpl_fields_label = 'Campos';
LANG_PT.inv_tpl_no_fields = 'Nenhum campo adicionado';
LANG_PT.inv_tpl_empty_editor_hint = 'Ainda não há colunas. Use «adicionar campo» abaixo: título da coluna e tipo (texto, número, lista, data, sim/não).';
LANG_PT.inv_tpl_badge_archived = 'arquivado';
LANG_PT.inv_modal_template_title = 'Modelo de inventário';
LANG_PT.inv_modal_template_new_title = 'Novo modelo';
LANG_PT.inv_modal_template_edit_title = 'Editar modelo';
LANG_PT.inv_modal_new_record_title = 'Novo registro';
LANG_PT.inv_modal_item_title = 'Item do inventário';
LANG_PT.inv_modal_item_add_title = 'Novo item';
LANG_PT.inv_modal_item_edit_title = 'Editar item';
LANG_PT.inv_field_template_name = 'Nome do modelo';
LANG_PT.inv_field_template_desc = 'Descrição (opcional)';
LANG_PT.inv_field_template_fields = 'Campos';
LANG_PT.inv_field_record_template = 'Modelo';
LANG_PT.inv_field_record_name = 'Nome do registro';
LANG_PT.inv_field_record_date = 'Data';
LANG_PT.inv_field_label_placeholder = 'Nome do campo';
LANG_PT.inv_field_options_label = 'Opções (separadas por vírgula)';
LANG_PT.inv_field_unit_placeholder = 'unid.';
LANG_PT.inv_field_required = 'Obrigatório';
LANG_PT.inv_field_type_text = 'Texto';
LANG_PT.inv_field_type_number = 'Número';
LANG_PT.inv_field_type_select = 'Lista';
LANG_PT.inv_field_type_date = 'Data';
LANG_PT.inv_field_type_boolean = 'Sim/Não';
LANG_PT.inv_field_type_multi_select = 'Múltipla escolha';
LANG_PT.inv_field_type_composite = 'ID composto';
LANG_PT.inv_field_select_source = 'Fonte dos valores';
LANG_PT.inv_field_source_options = 'Lista própria';
LANG_PT.inv_field_source_dictionary = 'Dicionário';
LANG_PT.inv_field_dictionary_pick = 'Dicionário';
LANG_PT.inv_field_unit_mode = 'Unidade';
LANG_PT.inv_field_unit_none = 'Nenhuma';
LANG_PT.inv_field_unit_free = 'Rótulo próprio';
LANG_PT.inv_field_unit_dictionary = 'Do dicionário';
LANG_PT.inv_field_unit_dictionary_short = 'u.';
LANG_PT.inv_field_composite_sep = 'Separador de partes';
LANG_PT.inv_field_composite_parts = 'Rótulos das partes';
LANG_PT.inv_field_no_options = 'Sem opções. Defina a lista no modelo ou preencha o dicionário.';
LANG_PT.inv_composite_part_default1 = 'Parte 1';
LANG_PT.inv_composite_part_default2 = 'Parte 2';
LANG_PT.inv_composite_part_default_short = 'Parte';
LANG_PT.inv_composite_add_part = 'parte';
LANG_PT.inv_composite_remove_part = 'Remover parte';
LANG_PT.dict_page_title = 'Dicionários';
LANG_PT.dict_page_desc = 'Dicionários integrados e personalizados — valores para campos com «Dicionário» ou unidades de um dicionário.';
LANG_PT.dict_page_hint_custom = 'Pode remover um dicionário personalizado com o botão vermelho «Excluir» abaixo da lista de valores. Os integrados não podem ser excluídos.';
LANG_PT.inv_dict_title_storage = 'Locais de armazenamento';
LANG_PT.inv_dict_title_units = 'Unidades de medida';
LANG_PT.inv_dict_one_per_line = 'Um valor por linha.';
LANG_PT.inv_dict_btn_new = '+ Novo dicionário';
LANG_PT.inv_dict_new_name_prompt = 'Nome do dicionário (como nas listas):';
LANG_PT.inv_dict_title_label = 'Nome exibido';
LANG_PT.inv_dict_slug_label = 'Código';
LANG_PT.inv_dict_delete = 'Excluir';
LANG_PT.inv_dict_confirm_delete = 'Excluir este dicionário? Será preciso ajustar manual os campos de modelo que o referenciam.';
LANG_PT.inv_dict_system_badge = 'integrado';
LANG_PT.inv_field_unit_value_source = 'Origem das unidades';
LANG_PT.inv_field_unit_options_label = 'Unidades (separadas por vírgula)';
LANG_PT.inv_toast_dictionary_saved = 'Dicionário salvo';
LANG_PT.inv_toast_dictionary_created = 'Dicionário criado';
LANG_PT.inv_toast_dictionary_deleted = 'Dicionário excluído';
LANG_PT.inv_toast_item_duplicated = 'Item duplicado';
LANG_PT.inv_btn_duplicate_item = 'Duplicar';
LANG_PT.inv_confirm_remove_field = 'Remover este campo do modelo?';
LANG_PT.inv_confirm_archive_template = 'Mover modelo para o arquivo? Não será possível criar novos registros com ele.';
LANG_PT.inv_btn_delete_template = 'Excluir modelo';
LANG_PT.inv_confirm_delete_template = 'Excluir o modelo «{name}»?';
LANG_PT.inv_confirm_delete_template_cascade = 'Excluir o modelo «{name}» e todos os registros de inventário que o usam ({n}) com todos os itens? Isto não pode ser desfeito.';
LANG_PT.inv_toast_template_deleted = 'Modelo excluído';
LANG_PT.inv_confirm_delete_record = 'Excluir este registro com todos os itens?';
LANG_PT.inv_confirm_delete_item = 'Excluir este item?';
LANG_PT.inv_confirm_edit_item = 'Salvar alterações neste item?';
LANG_PT.inv_err_template_name_required = 'O nome do modelo é obrigatório';
LANG_PT.inv_err_template_fields_required = 'Adicione pelo menos um campo';
LANG_PT.inv_err_record_name_required = 'O nome do registro é obrigatório';
LANG_PT.inv_err_template_required = 'Escolha um modelo';
LANG_PT.inv_err_template_missing = 'Modelo não encontrado';
LANG_PT.inv_err_template_archived = 'Modelo arquivado — escolha outro';
LANG_PT.inv_err_no_active_templates = 'Sem modelos ativos — crie um primeiro';
LANG_PT.inv_err_field_required = 'Campo obrigatório:';
LANG_PT.inv_err_popup_blocked = 'Permita pop-ups para imprimir';
LANG_PT.inv_toast_template_saved = 'Modelo salvo';
LANG_PT.inv_toast_template_duplicated = 'Modelo duplicado';
LANG_PT.inv_tpl_copy_suffix = ' (cópia)';
LANG_PT.inv_toast_template_sync_failed = 'Modelo salvo, mas os registros vinculados não puderam ser atualizados (veja o console)';
LANG_PT.inv_toast_template_archived = 'Modelo arquivado';
LANG_PT.inv_toast_template_restored = 'Modelo restaurado';
LANG_PT.inv_toast_record_created = 'Registro criado';
LANG_PT.inv_toast_record_deleted = 'Registro excluído';
LANG_PT.inv_toast_record_renamed = 'Registro renomeado';
LANG_PT.inv_toast_item_added = 'Item adicionado';
LANG_PT.inv_toast_item_updated = 'Item atualizado';
LANG_PT.inv_toast_item_deleted = 'Item excluído';
LANG_PT.inv_prompt_rename_record = 'Novo nome do registro:';
LANG_PT.inv_print_date = 'Data';
LANG_PT.inv_default_field_desc = 'Descrição';
LANG_PT.inv_default_field_qty = 'Quantidade';
LANG_PT.inv_seed_tpl_name = 'Peças sobressalentes (básico)';
LANG_PT.inv_seed_tpl_desc = 'Modelo básico. Você pode editar ou arquivar.';
LANG_PT.inv_seed_field_desc = 'Descrição';
LANG_PT.inv_seed_field_part = 'Número de catálogo';
LANG_PT.inv_seed_field_qty = 'Quantidade';
LANG_PT.inv_seed_field_loc = 'Local de armazenamento';
LANG_PT.inv_seed_unit_pcs = 'un.';
LANG_PT.inv_btn_open = 'Abrir';
LANG_PT.inv_btn_create = 'Criar';
LANG_PT.inv_btn_edit_short = 'Edit.';
LANG_PT.inv_yes = 'Sim';
LANG_PT.inv_no = 'Não';
