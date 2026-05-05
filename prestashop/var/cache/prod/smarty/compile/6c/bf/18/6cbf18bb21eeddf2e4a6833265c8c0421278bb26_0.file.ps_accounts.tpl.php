<?php
/* Smarty version 4.3.4, created on 2026-05-05 18:29:52
  from '/var/www/html/prestashop/modules/klaviyopsautomation/views/templates/admin/ps_accounts.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '4.3.4',
  'unifunc' => 'content_69fa0cf0a07639_91913351',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '6cbf18bb21eeddf2e4a6833265c8c0421278bb26' => 
    array (
      0 => '/var/www/html/prestashop/modules/klaviyopsautomation/views/templates/admin/ps_accounts.tpl',
      1 => 1777378818,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_69fa0cf0a07639_91913351 (Smarty_Internal_Template $_smarty_tpl) {
?><div
    id="klaviyops-admin-config-vuejs"
    data-vue="<?php echo call_user_func_array($_smarty_tpl->registered_plugins[ 'modifier' ][ 'escape' ][ 0 ], array( call_user_func_array($_smarty_tpl->registered_plugins[ 'modifier' ][ 'json_encode' ][ 0 ], array( $_smarty_tpl->tpl_vars['vueData']->value )),'htmlall','UTF-8' ));?>
"
></div>

<?php if (!$_smarty_tpl->tpl_vars['vueData']->value['psAccountsError']) {?>
    <?php echo '<script'; ?>
 src="<?php echo call_user_func_array($_smarty_tpl->registered_plugins[ 'modifier' ][ 'escape' ][ 0 ], array( $_smarty_tpl->tpl_vars['urlAccountsCdn']->value,'htmlall','UTF-8' ));?>
" type="text/javascript"><?php echo '</script'; ?>
>
<?php }
}
}
