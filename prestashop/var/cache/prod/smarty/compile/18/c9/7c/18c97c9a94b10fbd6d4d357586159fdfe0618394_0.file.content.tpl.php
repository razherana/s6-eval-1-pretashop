<?php
/* Smarty version 4.3.4, created on 2026-05-05 18:28:28
  from '/var/www/html/prestashop/admin525jetxf2fqbiknni9s/themes/default/template/content.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '4.3.4',
  'unifunc' => 'content_69fa0c9c8da6b7_24729465',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '18c97c9a94b10fbd6d4d357586159fdfe0618394' => 
    array (
      0 => '/var/www/html/prestashop/admin525jetxf2fqbiknni9s/themes/default/template/content.tpl',
      1 => 1777378818,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_69fa0c9c8da6b7_24729465 (Smarty_Internal_Template $_smarty_tpl) {
?><div id="ajax_confirmation" class="alert alert-success hide"></div>
<div id="ajaxBox" style="display:none"></div>
<div id="content-message-box"></div>

<?php if ((isset($_smarty_tpl->tpl_vars['content']->value))) {?>
	<?php echo $_smarty_tpl->tpl_vars['content']->value;?>

<?php }
}
}
