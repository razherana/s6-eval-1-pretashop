<?php
/* Smarty version 4.3.4, created on 2026-05-05 18:28:28
  from '/var/www/html/prestashop/modules/ps_mbo/views/templates/hook/dashboard-zone-two.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '4.3.4',
  'unifunc' => 'content_69fa0c9c8bcd49_92134237',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '925439bbccda4e8fdc212cb0dcbb349f8702d416' => 
    array (
      0 => '/var/www/html/prestashop/modules/ps_mbo/views/templates/hook/dashboard-zone-two.tpl',
      1 => 1777378818,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_69fa0c9c8bcd49_92134237 (Smarty_Internal_Template $_smarty_tpl) {
echo '<script'; ?>
>
  if (typeof window.mboCdc == undefined || typeof window.mboCdc == "undefined") {
    if (typeof renderCdcError === 'function') {
      window.$(document).ready(function() {
        renderCdcError($('#cdc-more-module-container'));
      });
    }
  } else {
    const renderMoreModule = window.mboCdc.renderDashboardMoreModule

    const context = <?php echo $_smarty_tpl->tpl_vars['shop_context']->value;?>
;

    renderMoreModule(context, '#cdc-more-module-container')
  }
<?php echo '</script'; ?>
>

<div class="row-margin-bottom cdc-container" id="cdc-more-module-container" data-error-path="<?php echo $_smarty_tpl->tpl_vars['cdcErrorUrl']->value;?>
"></div>
<?php }
}
