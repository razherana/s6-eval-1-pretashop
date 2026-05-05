<?php
/* Smarty version 4.3.4, created on 2026-05-05 18:29:52
  from '/var/www/html/prestashop/modules/klaviyopsautomation/views/templates/admin/config.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '4.3.4',
  'unifunc' => 'content_69fa0cf0a267e9_09674756',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'd504454522835d22a966840875e79e6eda5dd2d1' => 
    array (
      0 => '/var/www/html/prestashop/modules/klaviyopsautomation/views/templates/admin/config.tpl',
      1 => 1777378818,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_69fa0cf0a267e9_09674756 (Smarty_Internal_Template $_smarty_tpl) {
?><div class="klaviyo-container">
    <?php echo $_smarty_tpl->tpl_vars['psAccounts']->value;?>


    <div id="klaviyo-config">
        <?php echo $_smarty_tpl->tpl_vars['form']->value;?>

        <?php echo $_smarty_tpl->tpl_vars['couponConfig']->value;?>

        <?php echo $_smarty_tpl->tpl_vars['bisConfig']->value;?>

        <?php echo $_smarty_tpl->tpl_vars['orderStatusMapForm']->value;?>

        <?php echo $_smarty_tpl->tpl_vars['couponsGenerator']->value;?>

    </div>

    <?php echo '<script'; ?>
 src="<?php echo call_user_func_array($_smarty_tpl->registered_plugins[ 'modifier' ][ 'escape' ][ 0 ], array( $_smarty_tpl->tpl_vars['chunkVendorJs']->value,'htmlall','UTF-8' ));?>
"><?php echo '</script'; ?>
>
    <?php echo '<script'; ?>
 src="<?php echo call_user_func_array($_smarty_tpl->registered_plugins[ 'modifier' ][ 'escape' ][ 0 ], array( $_smarty_tpl->tpl_vars['adminConfigJs']->value,'htmlall','UTF-8' ));?>
"><?php echo '</script'; ?>
>
</div>
<?php }
}
