<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* __string_template__74795aa1c3ca8014ae46cb389630d56f */
class __TwigTemplate_60fd1eda47ecf45ef93feb90914233c1 extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
            'stylesheets' => [$this, 'block_stylesheets'],
            'extra_stylesheets' => [$this, 'block_extra_stylesheets'],
            'content_header' => [$this, 'block_content_header'],
            'content' => [$this, 'block_content'],
            'content_footer' => [$this, 'block_content_footer'],
            'sidebar_right' => [$this, 'block_sidebar_right'],
            'javascripts' => [$this, 'block_javascripts'],
            'extra_javascripts' => [$this, 'block_extra_javascripts'],
            'translate_javascripts' => [$this, 'block_translate_javascripts'],
        ];
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 1
        echo "<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\">
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">
<meta name=\"robots\" content=\"NOFOLLOW, NOINDEX\">

<link rel=\"icon\" type=\"image/x-icon\" href=\"/img/favicon.ico\" />
<link rel=\"apple-touch-icon\" href=\"/img/app_icon.png\" />

<title>Webservice • Herana</title>

  <script type=\"text/javascript\">
    var help_class_name = 'AdminWebservice';
    var iso_user = 'en';
    var lang_is_rtl = '0';
    var full_language_code = 'en-us';
    var full_cldr_language_code = 'en-US';
    var country_iso_code = 'MG';
    var _PS_VERSION_ = '8.2.6';
    var roundMode = 2;
    var youEditFieldFor = '';
        var new_order_msg = 'A new order has been placed on your store.';
    var order_number_msg = 'Order number: ';
    var total_msg = 'Total: ';
    var from_msg = 'From: ';
    var see_order_msg = 'View this order';
    var new_customer_msg = 'A new customer registered on your store.';
    var customer_name_msg = 'Customer name: ';
    var new_msg = 'A new message was posted on your store.';
    var see_msg = 'Read this message';
    var token = '787a3653cee58ba67bcc03e6b9880247';
    var currentIndex = 'index.php?controller=AdminWebservice';
    var employee_token = '3ff93d1343d4f79e7586eb4436883eb8';
    var choose_language_translate = 'Choose language:';
    var default_language = '1';
    var admin_modules_link = '/admin525jetxf2fqbiknni9s/index.php/improve/modules/manage?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0';
    var admin_notification_get_link = '/admin525jetxf2fqbiknni9s/index.php/common/notifications?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0';
    var admin_notification_push_link = adminNotificationPushLink = '/admin525jetxf2fqbiknni9s/index.php/common/notifications/ack?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0';
    var tab_modules_list = '';
    var update_success_msg = 'Update successful';
    var sea";
        // line 43
        echo "rch_product_msg = 'Search for a product';
  </script>



<link
      rel=\"preload\"
      href=\"/admin525jetxf2fqbiknni9s/themes/new-theme/public/2d8017489da689caedc1.preload..woff2\"
      as=\"font\"
      crossorigin
    >
      <link href=\"/admin525jetxf2fqbiknni9s/themes/new-theme/public/create_product_default_theme.css\" rel=\"stylesheet\" type=\"text/css\"/>
      <link href=\"/admin525jetxf2fqbiknni9s/themes/new-theme/public/theme.css\" rel=\"stylesheet\" type=\"text/css\"/>
      <link href=\"https://unpkg.com/@prestashopcorp/edition-reskin/dist/back.min.css\" rel=\"stylesheet\" type=\"text/css\"/>
      <link href=\"/js/jquery/plugins/chosen/jquery.chosen.css\" rel=\"stylesheet\" type=\"text/css\"/>
      <link href=\"/js/jquery/plugins/fancybox/jquery.fancybox.css\" rel=\"stylesheet\" type=\"text/css\"/>
      <link href=\"/modules/blockwishlist/public/backoffice.css\" rel=\"stylesheet\" type=\"text/css\"/>
      <link href=\"/admin525jetxf2fqbiknni9s/themes/default/css/vendor/nv.d3.css\" rel=\"stylesheet\" type=\"text/css\"/>
      <link href=\"/modules/klaviyopsautomation/dist/css/klaviyops-admin-global.b13cfc23.css\" rel=\"stylesheet\" type=\"text/css\"/>
      <link href=\"/modules/ps_facebook/views/css/admin/menu.css\" rel=\"stylesheet\" type=\"text/css\"/>
      <link href=\"/modules/psxmarketingwithgoogle/views/css/admin/menu.css\" rel=\"stylesheet\" type=\"text/css\"/>
  
  <script type=\"text/javascript\">
var baseAdminDir = \"\\/admin525jetxf2fqbiknni9s\\/\";
var baseDir = \"\\/\";
var changeFormLanguageUrl = \"\\/admin525jetxf2fqbiknni9s\\/index.php\\/configure\\/advanced\\/employees\\/change-form-language?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\";
var currency = {\"iso_code\":\"MGA\",\"sign\":\"Ar\",\"name\":\"Malagasy Ariary\",\"format\":null};
var currency_specifications = {\"symbol\":[\".\",\",\",\";\",\"%\",\"-\",\"+\",\"E\",\"\\u00d7\",\"\\u2030\",\"\\u221e\",\"NaN\"],\"currencyCode\":\"MGA\",\"currencySymbol\":\"Ar\",\"numberSymbols\":[\".\",\",\",\";\",\"%\",\"-\",\"+\",\"E\",\"\\u00d7\",\"\\u2030\",\"\\u221e\",\"NaN\"],\"positivePattern\":\"\\u00a4#,##0.00\",\"negativePattern\":\"-\\u00";
        // line 70
        echo "a4#,##0.00\",\"maxFractionDigits\":0,\"minFractionDigits\":0,\"groupingUsed\":true,\"primaryGroupSize\":3,\"secondaryGroupSize\":3};
var number_specifications = {\"symbol\":[\".\",\",\",\";\",\"%\",\"-\",\"+\",\"E\",\"\\u00d7\",\"\\u2030\",\"\\u221e\",\"NaN\"],\"numberSymbols\":[\".\",\",\",\";\",\"%\",\"-\",\"+\",\"E\",\"\\u00d7\",\"\\u2030\",\"\\u221e\",\"NaN\"],\"positivePattern\":\"#,##0.###\",\"negativePattern\":\"-#,##0.###\",\"maxFractionDigits\":3,\"minFractionDigits\":0,\"groupingUsed\":true,\"primaryGroupSize\":3,\"secondaryGroupSize\":3};
var prestashop = {\"debug\":false};
var ps_edition_basic_favicon = \"\\/modules\\/ps_edition_basic\\/views\\/favicon.png\";
var show_new_customers = \"1\";
var show_new_messages = \"1\";
var show_new_orders = \"1\";
</script>
<script type=\"text/javascript\" src=\"/modules/ps_edition_basic/views/js/favicon.js\"></script>
<script type=\"text/javascript\" src=\"/admin525jetxf2fqbiknni9s/themes/new-theme/public/main.bundle.js\"></script>
<script type=\"text/javascript\" src=\"/js/jquery/plugins/jquery.chosen.js\"></script>
<script type=\"text/javascript\" src=\"/js/jquery/plugins/fancybox/jquery.fancybox.js\"></script>
<script type=\"text/javascript\" src=\"/js/admin.js?v=8.2.6\"></script>
<script type=\"text/javascript\" src=\"/admin525jetxf2fqbiknni9s/themes/new-theme/public/cldr.bundle.js\"></script>
<script type=\"text/javascript\" src=\"/js/tools.js?v=8.2.6\"></script>
<script type=\"text/javascript\" src=\"/admin525jetxf2fqbiknni9s/themes/new-theme/public/create_product.bundle.js\"></script>
<script type=\"text/javascript\" src=\"/modules/blockwishlist/public/vendors.js\"></script>
<script type=\"text/javascript\" src=\"/js/vendor/d3.v3.min.js\"></script>
<script type=\"text/javascript\" src=\"/admin525jetxf2fqbiknni9s/themes/default/js/vendor/nv.d3.min.js\"></script>
<script type=\"text/javascript\" src=\"/modules/ps_emailalerts/js/admin/ps_emailalerts.js\"></script>
<script type=\"text/javascript\" src=\"/modules/ps_mbo/views/js/recommended-modules.js?v=4.14.1\"></script>
<script type=\"text/javascript\" src=\"/modules/gamification/views/js/gamification_bt.js\"></sc";
        // line 91
        echo "ript>
<script type=\"text/javascript\" src=\"/modules/ps_accounts/views/js/notifications.js?ctx=http%3A%2F%2Flocalhost%2Fadmin525jetxf2fqbiknni9s%2Findex.php%3Fcontroller%3DAdminAjaxPsAccounts%26ajax%3D1%26token%3D31b79f976cd4abd779662ba0ec7ddb57%26action%3DgetNotifications&v=8.0.13\"></script>
<script type=\"text/javascript\" src=\"/modules/ps_faviconnotificationbo/views/js/favico.js\"></script>
<script type=\"text/javascript\" src=\"/modules/ps_faviconnotificationbo/views/js/ps_faviconnotificationbo.js\"></script>

  <script>
  if (undefined !== ps_faviconnotificationbo) {
    ps_faviconnotificationbo.initialize({
      backgroundColor: '#DF0067',
      textColor: '#FFFFFF',
      notificationGetUrl: '/admin525jetxf2fqbiknni9s/index.php/common/notifications?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0',
      CHECKBOX_ORDER: 1,
      CHECKBOX_CUSTOMER: 1,
      CHECKBOX_MESSAGE: 1,
      timer: 120000, // Refresh every 2 minutes
    });
  }
</script>
    <script>
        window.userLocale  = 'en';
        window.userflow_id = 'ct_55jfryadgneorc45cjqxpbf6o4';
    </script>
    <script type=\"module\" src=\"https://unpkg.com/@prestashopcorp/smb-edition-homepage/dist/assets/index.js\"></script><script>
            var admin_gamification_ajax_url = \"http:\\/\\/localhost\\/admin525jetxf2fqbiknni9s\\/index.php?controller=AdminGamification&token=c6bd2cd2d2294d39f6ca9b82bf8207d9\";
            var current_id_tab = 106;
        </script>

";
        // line 118
        $this->displayBlock('stylesheets', $context, $blocks);
        $this->displayBlock('extra_stylesheets', $context, $blocks);
        echo "</head>";
        echo "

<body
  class=\"lang-en adminwebservice\"
  data-base-url=\"/admin525jetxf2fqbiknni9s/index.php\"  data-token=\"DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\">

  <header id=\"header\" class=\"d-print-none\">

    <nav id=\"header_infos\" class=\"main-header\">
      <button class=\"btn btn-primary-reverse onclick btn-lg unbind ajax-spinner\"></button>

            <i class=\"material-icons js-mobile-menu\">menu</i>
      <a id=\"header_logo\" class=\"logo float-left\" href=\"/admin525jetxf2fqbiknni9s/index.php/modules/pseditionbasic/homepage?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\"></a>
      <span id=\"shop_version\">8.2.6</span>

      <div class=\"component\" id=\"quick-access-container\">
        <div class=\"dropdown quick-accesses\">
  <button class=\"btn btn-link btn-sm dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\" id=\"quick_select\">
    Quick Access
  </button>
  <div class=\"dropdown-menu\">
          <a class=\"dropdown-item quick-row-link \"
         href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminStats&amp;module=statscheckup&amp;token=1c238b56481f441ef647ae1fd154516b\"
                 data-item=\"Catalog evaluation\"
      >Catalog evaluation</a>
          <a class=\"dropdown-item quick-row-link \"
         href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php/improve/modules/manage?token=3733080834834e62f7d5d7e02793c473\"
                 data-item=\"Installed modules\"
      >Installed modules</a>
          <a class=\"dropdown-item quick-row-link \"
         href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php/sell/catalog/categories/new?token=3733080834834e62f7d5d7e02793c473\"
                 data-item=\"New category\"
      >New category</a>
          <a class=\"dropdown-item quick-row-link new-product-button\"
         href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php/sell/catalog/products-v2/create?token=3733080834834e62f7d5d7e02793c473\"
                 data-item=\"New product\"
      >New p";
        // line 154
        echo "roduct</a>
          <a class=\"dropdown-item quick-row-link \"
         href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminCartRules&amp;addcart_rule&amp;token=3f5aecd75ef1a5d273db3d72ed27135d\"
                 data-item=\"New voucher\"
      >New voucher</a>
          <a class=\"dropdown-item quick-row-link \"
         href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php/sell/orders?token=3733080834834e62f7d5d7e02793c473\"
                 data-item=\"Orders\"
      >Orders</a>
        <div class=\"dropdown-divider\"></div>
          <a id=\"quick-add-link\"
        class=\"dropdown-item js-quick-link\"
        href=\"#\"
        data-rand=\"189\"
        data-icon=\"icon-AdminAdvancedParameters\"
        data-method=\"add\"
        data-url=\"index.php/configure/advanced/webservice-keys/?-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\"
        data-post-link=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminQuickAccesses&amp;token=8c15601b29bedd347f2b26ec2d75b37a\"
        data-prompt-text=\"Please name this shortcut:\"
        data-link=\"Webservice - List\"
      >
        <i class=\"material-icons\">add_circle</i>
        Add current page to Quick Access
      </a>
        <a id=\"quick-manage-link\" class=\"dropdown-item\" href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminQuickAccesses&amp;token=8c15601b29bedd347f2b26ec2d75b37a\">
      <i class=\"material-icons\">settings</i>
      Manage your quick accesses
    </a>
  </div>
</div>
      </div>
      <div class=\"component component-search\" id=\"header-search-container\">
        <div class=\"component-search-body\">
          <div class=\"component-search-top\">
            <form id=\"header_search\"
      class=\"bo_search_form dropdown-form js-dropdown-form collapsed\"
      method=\"post\"
      action=\"/admin525jetxf2fqbiknni9s/index.php?controller=AdminSearch&amp;token=41ef22eadd70ff88f2a148de4c4ab419\"
      role=\"search\">
  <input type=\"hidden\" name=\"bo_search_type\" id=\"bo_search_type\" class=";
        // line 193
        echo "\"js-search-type\" />
    <div class=\"input-group\">
    <input type=\"text\" class=\"form-control js-form-search\" id=\"bo_query\" name=\"bo_query\" value=\"\" placeholder=\"Search (e.g.: product reference, customer name…)\" aria-label=\"Searchbar\">
    <div class=\"input-group-append\">
      <button type=\"button\" class=\"btn btn-outline-secondary dropdown-toggle js-dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">
        Everywhere
      </button>
      <div class=\"dropdown-menu js-items-list\">
        <a class=\"dropdown-item\" data-item=\"Everywhere\" href=\"#\" data-value=\"0\" data-placeholder=\"What are you looking for?\" data-icon=\"icon-search\"><i class=\"material-icons\">search</i> Everywhere</a>
        <div class=\"dropdown-divider\"></div>
        <a class=\"dropdown-item\" data-item=\"Catalog\" href=\"#\" data-value=\"1\" data-placeholder=\"Product name, reference, etc.\" data-icon=\"icon-book\"><i class=\"material-icons\">store_mall_directory</i> Catalog</a>
        <a class=\"dropdown-item\" data-item=\"Customers by name\" href=\"#\" data-value=\"2\" data-placeholder=\"Name\" data-icon=\"icon-group\"><i class=\"material-icons\">group</i> Customers by name</a>
        <a class=\"dropdown-item\" data-item=\"Customers by ip address\" href=\"#\" data-value=\"6\" data-placeholder=\"123.45.67.89\" data-icon=\"icon-desktop\"><i class=\"material-icons\">desktop_mac</i> Customers by IP address</a>
        <a class=\"dropdown-item\" data-item=\"Orders\" href=\"#\" data-value=\"3\" data-placeholder=\"Order ID\" data-icon=\"icon-credit-card\"><i class=\"material-icons\">shopping_basket</i> Orders</a>
        <a class=\"dropdown-item\" data-item=\"Invoices\" href=\"#\" data-value=\"4\" data-placeholder=\"Invoice number\" data-icon=\"icon-book\"><i class=\"material-icons\">book</i> Invoices</a>
        <a class=\"dropdown-item\" data-item=\"Carts\" href=\"#\" data-value=\"5\" data-placeholder=\"Cart ID\" data-icon=\"icon-shopping-cart\"><i class=\"material-icons\">shopping_cart</i> Carts</a>
        <a class=\"dropdown-item\" data-item=\"Modules";
        // line 209
        echo "\" href=\"#\" data-value=\"7\" data-placeholder=\"Module name\" data-icon=\"icon-puzzle-piece\"><i class=\"material-icons\">extension</i> Modules</a>
      </div>
      <button class=\"btn btn-primary\" type=\"submit\"><span class=\"d-none\">SEARCH</span><i class=\"material-icons\">search</i></button>
    </div>
  </div>
</form>

<script type=\"text/javascript\">
 \$(document).ready(function(){
    \$('#bo_query').one('click', function() {
    \$(this).closest('form').removeClass('collapsed');
  });
});
</script>
            <button class=\"component-search-cancel d-none\">Cancel</button>
          </div>

          <div class=\"component-search-quickaccess d-none\">
  <p class=\"component-search-title\">Quick Access</p>
      <a class=\"dropdown-item quick-row-link\"
       href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminStats&amp;module=statscheckup&amp;token=1c238b56481f441ef647ae1fd154516b\"
             data-item=\"Catalog evaluation\"
    >Catalog evaluation</a>
      <a class=\"dropdown-item quick-row-link\"
       href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php/improve/modules/manage?token=3733080834834e62f7d5d7e02793c473\"
             data-item=\"Installed modules\"
    >Installed modules</a>
      <a class=\"dropdown-item quick-row-link\"
       href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php/sell/catalog/categories/new?token=3733080834834e62f7d5d7e02793c473\"
             data-item=\"New category\"
    >New category</a>
      <a class=\"dropdown-item quick-row-link\"
       href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php/sell/catalog/products-v2/create?token=3733080834834e62f7d5d7e02793c473\"
             data-item=\"New product\"
    >New product</a>
      <a class=\"dropdown-item quick-row-link\"
       href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminCartRules&amp;addcart_rule&amp;token=3f5aecd75ef1a5d273db3d72ed27135d\"
             data-item=\"New voucher\"
    >New voucher</a>
      <a class=\"dropdown-item quick-row-link\"
";
        // line 249
        echo "       href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php/sell/orders?token=3733080834834e62f7d5d7e02793c473\"
             data-item=\"Orders\"
    >Orders</a>
    <div class=\"dropdown-divider\"></div>
      <a id=\"quick-add-link\"
      class=\"dropdown-item js-quick-link\"
      href=\"#\"
      data-rand=\"108\"
      data-icon=\"icon-AdminAdvancedParameters\"
      data-method=\"add\"
      data-url=\"index.php/configure/advanced/webservice-keys/?-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\"
      data-post-link=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminQuickAccesses&amp;token=8c15601b29bedd347f2b26ec2d75b37a\"
      data-prompt-text=\"Please name this shortcut:\"
      data-link=\"Webservice - List\"
    >
      <i class=\"material-icons\">add_circle</i>
      Add current page to Quick Access
    </a>
    <a id=\"quick-manage-link\" class=\"dropdown-item\" href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminQuickAccesses&amp;token=8c15601b29bedd347f2b26ec2d75b37a\">
    <i class=\"material-icons\">settings</i>
    Manage your quick accesses
  </a>
</div>
        </div>

        <div class=\"component-search-background d-none\"></div>
      </div>

      
                      <div class=\"component hide-mobile-sm\" id=\"header-maintenance-mode-container\">
          <a class=\"link shop-state\"
             id=\"maintenance-mode\"
             data-toggle=\"pstooltip\"
             data-placement=\"bottom\"
             data-html=\"true\"
             title=\"          &lt;p class=&quot;text-left text-nowrap&quot;&gt;
            &lt;strong&gt;Your store is in maintenance mode.&lt;/strong&gt;
          &lt;/p&gt;
          &lt;p class=&quot;text-left&quot;&gt;
              Your visitors and customers cannot access your store while in maintenance mode.
          &lt;/p&gt;
          &lt;p class=&quot;text-left&quot;&gt;
              To manage the maintenance settings, go to Shop Parameters &amp;gt; General &amp;gt; Maintenance tab.
          &lt;/p&gt;
      ";
        // line 293
        echo "                &lt;p class=&quot;text-left&quot;&gt;
              Admins can access the store front office without storing their IP.
            &lt;/p&gt;
                  \"
             href=\"/admin525jetxf2fqbiknni9s/index.php/configure/shop/maintenance/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\"
          >
            <i class=\"material-icons\"
              style=\"color: var(--green);\"
            >build</i>
            <span>Maintenance mode</span>
          </a>
        </div>
      
      <div class=\"header-right\">
                  <div class=\"component\" id=\"header-shop-list-container\">
              <div class=\"shop-list\">
    <a class=\"link\" id=\"header_shopname\" href=\"http://localhost/\" target= \"_blank\">
      <i class=\"material-icons\">visibility</i>
      <span>View my store</span>
    </a>
  </div>
          </div>
                          <div class=\"component header-right-component\" id=\"header-notifications-container\">
            <div id=\"notif\" class=\"notification-center dropdown dropdown-clickable\">
  <button class=\"btn notification js-notification dropdown-toggle\" data-toggle=\"dropdown\">
    <i class=\"material-icons\">notifications_none</i>
    <span id=\"notifications-total\" class=\"count hide\">0</span>
  </button>
  <div class=\"dropdown-menu dropdown-menu-right js-notifs_dropdown\">
    <div class=\"notifications\">
      <ul class=\"nav nav-tabs\" role=\"tablist\">
                          <li class=\"nav-item\">
            <a
              class=\"nav-link active\"
              id=\"orders-tab\"
              data-toggle=\"tab\"
              data-type=\"order\"
              href=\"#orders-notifications\"
              role=\"tab\"
            >
              Orders<span id=\"_nb_new_orders_\"></span>
            </a>
          </li>
                                    <li class=\"nav-item\">
            <a
              class=\"nav-link \"
              id=\"customers-tab\"
              data-toggle=\"tab\"
              data-type=\"customer\"
              hre";
        // line 342
        echo "f=\"#customers-notifications\"
              role=\"tab\"
            >
              Customers<span id=\"_nb_new_customers_\"></span>
            </a>
          </li>
                                    <li class=\"nav-item\">
            <a
              class=\"nav-link \"
              id=\"messages-tab\"
              data-toggle=\"tab\"
              data-type=\"customer_message\"
              href=\"#messages-notifications\"
              role=\"tab\"
            >
              Messages<span id=\"_nb_new_messages_\"></span>
            </a>
          </li>
                        </ul>

      <!-- Tab panes -->
      <div class=\"tab-content\">
                          <div class=\"tab-pane active empty\" id=\"orders-notifications\" role=\"tabpanel\">
            <p class=\"no-notification\">
              No new order for now :(<br>
              Have you checked your <strong><a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminCarts&action=filterOnlyAbandonedCarts&token=9c045052c414cc007fd5f4fc5e182b5b\">abandoned carts</a></strong>?<br>Your next order could be hiding there!
            </p>
            <div class=\"notification-elements\"></div>
          </div>
                                    <div class=\"tab-pane  empty\" id=\"customers-notifications\" role=\"tabpanel\">
            <p class=\"no-notification\">
              No new customer for now :(<br>
              Are you active on social media these days?
            </p>
            <div class=\"notification-elements\"></div>
          </div>
                                    <div class=\"tab-pane  empty\" id=\"messages-notifications\" role=\"tabpanel\">
            <p class=\"no-notification\">
              No new message for now.<br>
              Seems like all your customers are happy :)
            </p>
            <div class=\"notification-elements\"></div>
          </div>
                        </div>
    </div>
  </div>
</div>

  <script type=\"text/html\" id=\"order-notification-template\">
    <a class=\"notif";
        // line 391
        echo "\" href='order_url'>
      #_id_order_ -
      from <strong>_customer_name_</strong> (_iso_code_)_carrier_
      <strong class=\"float-sm-right\">_total_paid_</strong>
    </a>
  </script>

  <script type=\"text/html\" id=\"customer-notification-template\">
    <a class=\"notif\" href='customer_url'>
      #_id_customer_ - <strong>_customer_name_</strong>_company_ - registered <strong>_date_add_</strong>
    </a>
  </script>

  <script type=\"text/html\" id=\"message-notification-template\">
    <a class=\"notif\" href='message_url'>
    <span class=\"message-notification-status _status_\">
      <i class=\"material-icons\">fiber_manual_record</i> _status_
    </span>
      - <strong>_customer_name_</strong> (_company_) - <i class=\"material-icons\">access_time</i> _date_add_
    </a>
  </script>
          </div>
        
        <div class=\"component\" id=\"header-employee-container\">
          <div class=\"dropdown employee-dropdown\">
  <div class=\"rounded-circle person\" data-toggle=\"dropdown\">
    <i class=\"material-icons\">account_circle</i>
  </div>
  <div class=\"dropdown-menu dropdown-menu-right\">
    <div class=\"employee-wrapper-avatar\">
      <div class=\"employee-top\">
        <span class=\"employee-avatar\"><img class=\"avatar rounded-circle\" src=\"http://localhost/img/pr/default.jpg\" alt=\"Herana\" /></span>
        <span class=\"employee_profile\">Welcome back Herana</span>
      </div>

      <a class=\"dropdown-item employee-link profile-link\" href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/employees/1/edit?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\">
      <i class=\"material-icons\">edit</i>
      <span>Your profile</span>
    </a>
    </div>

    <p class=\"divider\"></p>

                  <a class=\"dropdown-item \" href=\"https://accounts.distribution.prestashop.net?utm_source=localhost&utm_medium=back-office&utm_campaign=ps_accounts&utm_content=headeremployeedropdownlink\"  target=\"_blank\" rel=\"noopener noreferrer nofollow\">
            <i class=\"material-icons\">open";
        // line 435
        echo "_in_new</i> Manage your PrestaShop account
        </a>
                          <a class=\"dropdown-item ps_mbo\" href=\"https://www.prestashop.com/en/training?utm_source=back-office&utm_medium=menu&utm_content=download8_2&utm_campaign=training-en\"  target=\"_blank\" rel=\"noopener noreferrer nofollow\">
            <i class=\"material-icons\">school</i> Training
        </a>
                          <a class=\"dropdown-item ps_mbo\" href=\"https://www.prestashop.com/en/experts?utm_source=back-office&utm_medium=menu&utm_content=download8_2&utm_campaign=expert-en\"  target=\"_blank\" rel=\"noopener noreferrer nofollow\">
            <i class=\"material-icons\">person_pin_circle</i> Find an expert
        </a>
                          <a class=\"dropdown-item ps_mbo\" href=\"/admin525jetxf2fqbiknni9s/index.php/modules/mbo/modules/catalog/?utm_mbo_source=menu-user-back-office&_token=Jq-VsGwSS_Yl8tD195FBKyIHPsgu-TvK0oMogJLHD_I&utm_source=back-office&utm_medium=menu&utm_content=download8_2&utm_campaign=addons-en\"  rel=\"noopener noreferrer nofollow\">
            <i class=\"material-icons\">extension</i> Prestashop Marketplace
        </a>
                          <a class=\"dropdown-item ps_mbo\" href=\"https://help-center.prestashop.com/en?utm_source=back-office&utm_medium=menu&utm_content=download8_2&utm_campaign=help-center-en\"  target=\"_blank\" rel=\"noopener noreferrer nofollow\">
            <i class=\"material-icons\">help</i> Help Center
        </a>
                  <p class=\"divider\"></p>
            
    <a class=\"dropdown-item employee-link text-center\" id=\"header_logout\" href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminLogin&amp;logout=1&amp;token=6b030e8fdc90b1b0e17fc433a2695a14\">
      <i class=\"material-icons d-lg-none\">power_settings_new</i>
      <span>Sign out</span>
    </a>
  </div>
</div>
        </div>
              </div>
    </nav>
  </header>

  <nav class=\"nav-bar d-none d-print-none d-md-block\">
  <span class=\"menu-collapse\" data-toggle-url=\"/ad";
        // line 463
        echo "min525jetxf2fqbiknni9s/index.php/configure/advanced/employees/toggle-navigation?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\">
    <i class=\"material-icons rtl-flip\">chevron_left</i>
    <i class=\"material-icons rtl-flip\">chevron_left</i>
  </span>

  <div class=\"nav-bar-overflow\">
      <div class=\"logo-container\">
          <a id=\"header_logo\" class=\"logo float-left\" href=\"/admin525jetxf2fqbiknni9s/index.php/modules/pseditionbasic/homepage?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\"></a>
          <span id=\"shop_version\" class=\"header-version\">8.2.6</span>
      </div>

      <ul class=\"main-menu\">
              
                                          
                    
          
            <li class=\"category-title\" data-submenu=\"147\" id=\"tab-HOME\">
                <span class=\"title\">Welcome</span>
            </li>

                              
                  
                                                      
                  
                  <li class=\"link-levelone\" data-submenu=\"148\" id=\"subtab-AdminPsEditionBasicHomepageController\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/modules/pseditionbasic/homepage?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-home\">home</i>
                      <span>
                      Home
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone\" data-submenu=\"1\" id=\"subtab-AdminDashboard\">
                    <a";
        // line 503
        echo " href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminDashboard&amp;token=eb319c15dac0e69266ab9a7887ffbdeb\" class=\"link\">
                      <i class=\"material-icons mi-trending_up\">trending_up</i>
                      <span>
                      Dashboard
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                        </li>
                              
          
                      
                                          
                    
          
            <li class=\"category-title\" data-submenu=\"2\" id=\"tab-SELL\">
                <span class=\"title\">Sell</span>
            </li>

                              
                  
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"3\" id=\"subtab-AdminParentOrders\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/orders/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-shopping_basket\">shopping_basket</i>
                      <span>
                      Orders
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                              <ul id=\"collapse-3\" class=\"submenu panel-collapse\">
                                                      
                              
                                        ";
        // line 540
        echo "                    
                              <li class=\"link-leveltwo\" data-submenu=\"4\" id=\"subtab-AdminOrders\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/orders/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Orders
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"5\" id=\"subtab-AdminInvoices\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/orders/invoices/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Invoices
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"6\" id=\"subtab-AdminSlip\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/orders/credit-slips/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Credit Slips
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"7\" id=\"subtab-AdminDeliverySlip\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/orders/delivery-slips/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Delivery Slips
                                </a>
                              </li>

                                                       ";
        // line 570
        echo "                           
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"8\" id=\"subtab-AdminCarts\">
                                <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminCarts&amp;token=9c045052c414cc007fd5f4fc5e182b5b\" class=\"link\"> Shopping Carts
                                </a>
                              </li>

                                                                              </ul>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"9\" id=\"subtab-AdminCatalog\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/catalog/products?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-store\">store</i>
                      <span>
                      Catalog
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                              <ul id=\"collapse-9\" class=\"submenu panel-collapse\">
                                                      
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"10\" id=\"subtab-AdminProducts\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/catalog/products?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Products
                           ";
        // line 600
        echo "     </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"11\" id=\"subtab-AdminCategories\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/catalog/categories?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Categories
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"12\" id=\"subtab-AdminTracking\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/catalog/monitoring/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Monitoring
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"13\" id=\"subtab-AdminParentAttributesGroups\">
                                <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminAttributesGroups&amp;token=09f04b22a4562f1dd69fa7cbe68ab5a0\" class=\"link\"> Attributes &amp; Features
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"16\" id=\"subtab-AdminParentManufacturers\">
                                <";
        // line 631
        echo "a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/catalog/brands/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Brands &amp; Suppliers
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"19\" id=\"subtab-AdminAttachments\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/attachments/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Files
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"20\" id=\"subtab-AdminParentCartRules\">
                                <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminCartRules&amp;token=3f5aecd75ef1a5d273db3d72ed27135d\" class=\"link\"> Discounts
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"23\" id=\"subtab-AdminStockManagement\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/stocks/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Stock
                                </a>
                              </li>

                                                                              </ul>
                                        </li>
                                              
            ";
        // line 662
        echo "      
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"24\" id=\"subtab-AdminParentCustomer\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/customers/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-account_circle\">account_circle</i>
                      <span>
                      Customers
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                              <ul id=\"collapse-24\" class=\"submenu panel-collapse\">
                                                      
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"25\" id=\"subtab-AdminCustomers\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/customers/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Customers
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"26\" id=\"subtab-AdminAddresses\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/addresses/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Addresses
                                </a>
                              </li>

                                                                                  ";
        // line 692
        echo "                                                  </ul>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"28\" id=\"subtab-AdminParentCustomerThreads\">
                    <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminCustomerThreads&amp;token=94867e66b3d4d1adf777f1d7664b5330\" class=\"link\">
                      <i class=\"material-icons mi-chat\">chat</i>
                      <span>
                      Customer Service
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                              <ul id=\"collapse-28\" class=\"submenu panel-collapse\">
                                                      
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"29\" id=\"subtab-AdminCustomerThreads\">
                                <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminCustomerThreads&amp;token=94867e66b3d4d1adf777f1d7664b5330\" class=\"link\"> Customer Service
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"30\" id=\"subtab-AdminOrderMessage\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/sell/customer-service/order-m";
        // line 721
        echo "essages/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Order Messages
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"31\" id=\"subtab-AdminReturn\">
                                <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminReturn&amp;token=040e691e13d9d13d83e3c0dcaab6b237\" class=\"link\"> Merchandise Returns
                                </a>
                              </li>

                                                                              </ul>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone\" data-submenu=\"32\" id=\"subtab-AdminStats\">
                    <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminStats&amp;token=1c238b56481f441ef647ae1fd154516b\" class=\"link\">
                      <i class=\"material-icons mi-assessment\">assessment</i>
                      <span>
                      Stats
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                        </li>
                              
          
                      
                                          
                    
          
            <li class=\"category-title\" data-submenu=\"37\" id=\"tab-IMPROVE\">
                <span class=\"title\">Improve</span>
     ";
        // line 758
        echo "       </li>

                              
                  
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"38\" id=\"subtab-AdminParentModulesSf\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/modules/mbo/modules/catalog/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-extension\">extension</i>
                      <span>
                      Modules
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                              <ul id=\"collapse-38\" class=\"submenu panel-collapse\">
                                                                                                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"153\" id=\"subtab-AdminPsMboModuleParent\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/modules/mbo/modules/catalog/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Marketplace
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"39\" id=\"subtab-AdminModulesSf\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/modules/manage?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-x";
        // line 787
        echo "bC3vihr4CEgvk4L0\" class=\"link\"> Module Manager
                                </a>
                              </li>

                                                                                                                                                                                          </ul>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"43\" id=\"subtab-AdminParentThemes\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/design/themes/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-desktop_mac\">desktop_mac</i>
                      <span>
                      Design
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                              <ul id=\"collapse-43\" class=\"submenu panel-collapse\">
                                                      
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"163\" id=\"subtab-AdminThemesParent\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/design/themes/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Theme &amp; Logo
                                </a>
                              </li>

                                                                                  
                              
                                                        ";
        // line 818
        echo "    
                              <li class=\"link-leveltwo\" data-submenu=\"157\" id=\"subtab-AdminPsMboTheme\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/modules/mbo/themes/catalog/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Themes Catalog
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"45\" id=\"subtab-AdminParentMailTheme\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/design/mail_theme/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Email Theme
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"47\" id=\"subtab-AdminCmsContent\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/design/cms-pages/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Pages
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"48\" id=\"subtab-AdminModulesPositions\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/design/modules/positions/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Positions
                                </a>
                              </li>

                    ";
        // line 848
        echo "                                                              
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"49\" id=\"subtab-AdminImages\">
                                <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminImages&amp;token=77e4afc599137497e6f887f828094ea3\" class=\"link\"> Image Settings
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"118\" id=\"subtab-AdminLinkWidget\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/modules/link-widget/list?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Link List
                                </a>
                              </li>

                                                                              </ul>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"50\" id=\"subtab-AdminParentShipping\">
                    <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminCarriers&amp;token=b7a28fc783f2acf48b5056b4881a5c59\" class=\"link\">
                      <i class=\"material-icons mi-local_shipping\">local_shipping</i>
                      <span>
                      Shipping
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                      ";
        // line 878
        echo "      </i>
                                            </a>
                                              <ul id=\"collapse-50\" class=\"submenu panel-collapse\">
                                                      
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"51\" id=\"subtab-AdminCarriers\">
                                <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminCarriers&amp;token=b7a28fc783f2acf48b5056b4881a5c59\" class=\"link\"> Carriers
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"52\" id=\"subtab-AdminShipping\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/shipping/preferences/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Preferences
                                </a>
                              </li>

                                                                              </ul>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"53\" id=\"subtab-AdminParentPayment\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/payment/payment_methods?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-payment\">payment</i>
                      <span>
                      Payment
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
      ";
        // line 910
        echo "                                                              keyboard_arrow_down
                                                            </i>
                                            </a>
                                              <ul id=\"collapse-53\" class=\"submenu panel-collapse\">
                                                      
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"54\" id=\"subtab-AdminPayment\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/payment/payment_methods?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Payment Methods
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"55\" id=\"subtab-AdminPaymentPreferences\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/payment/preferences?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Preferences
                                </a>
                              </li>

                                                                              </ul>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"56\" id=\"subtab-AdminInternational\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/international/localization/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-language\">language</i>
                      <span>
     ";
        // line 940
        echo "                 International
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                              <ul id=\"collapse-56\" class=\"submenu panel-collapse\">
                                                      
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"57\" id=\"subtab-AdminParentLocalization\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/international/localization/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Localization
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"62\" id=\"subtab-AdminParentCountries\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/international/zones/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Locations
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"66\" id=\"subtab-AdminParentTaxes\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/international/taxes/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Taxes
                        ";
        // line 968
        echo "        </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"69\" id=\"subtab-AdminTranslations\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/improve/international/translations/settings?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Translations
                                </a>
                              </li>

                                                                              </ul>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"127\" id=\"subtab-Marketing\">
                    <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminPsfacebookModule&amp;token=c9dda9e2b8a7d182484cdcfff4f06368\" class=\"link\">
                      <i class=\"material-icons mi-campaign\">campaign</i>
                      <span>
                      Marketing
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                              <ul id=\"collapse-127\" class=\"submenu panel-collapse\">
                                                      
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"128\" id=\"subtab-AdminPsfacebookModule\">
                                <a href";
        // line 1000
        echo "=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminPsfacebookModule&amp;token=c9dda9e2b8a7d182484cdcfff4f06368\" class=\"link\"> Facebook &amp; Instagram
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"166\" id=\"subtab-AdminPsxMktgWithGoogleModule\">
                                <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminPsxMktgWithGoogleModule&amp;token=9d8f69bfb8999e81bd2f57f7d26f6967\" class=\"link\"> Google
                                </a>
                              </li>

                                                                              </ul>
                                        </li>
                              
          
                      
                                          
                    
          
            <li class=\"category-title link-active\" data-submenu=\"70\" id=\"tab-CONFIGURE\">
                <span class=\"title\">Configure</span>
            </li>

                              
                  
                                                      
                  
                  <li class=\"link-levelone\" data-submenu=\"149\" id=\"subtab-AdminPsEditionBasicSettingsController\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/modules/pseditionbasic/settings?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-settings\">settings</i>
                      <span>
                      Settings
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
               ";
        // line 1036
        echo "                                             </i>
                                            </a>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone has_submenu\" data-submenu=\"71\" id=\"subtab-ShopParameters\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/shop/preferences/preferences?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-settings\">settings</i>
                      <span>
                      Shop Parameters
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                              <ul id=\"collapse-71\" class=\"submenu panel-collapse\">
                                                      
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"72\" id=\"subtab-AdminParentPreferences\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/shop/preferences/preferences?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> General
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"75\" id=\"subtab-AdminParentOrderPreferences\">
                                <a href=\"/admin525jetxf2fqbiknni9s/";
        // line 1066
        echo "index.php/configure/shop/order-preferences/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Order Settings
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"78\" id=\"subtab-AdminPPreferences\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/shop/product-preferences/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Product Settings
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"79\" id=\"subtab-AdminParentCustomerPreferences\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/shop/customer-preferences/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Customer Settings
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"83\" id=\"subtab-AdminParentStores\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/shop/contacts/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Contact
                                </a>
                              </li>

                                                                                  
                              
                                          ";
        // line 1096
        echo "                  
                              <li class=\"link-leveltwo\" data-submenu=\"86\" id=\"subtab-AdminParentMeta\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/shop/seo-urls/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Traffic &amp; SEO
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"89\" id=\"subtab-AdminParentSearchConf\">
                                <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminSearchConf&amp;token=ee7632dbc62305da2abc5fe266635c40\" class=\"link\"> Search
                                </a>
                              </li>

                                                                              </ul>
                                        </li>
                                              
                  
                                                      
                                                          
                  <li class=\"link-levelone has_submenu link-active open ul-open\" data-submenu=\"92\" id=\"subtab-AdminAdvancedParameters\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/system-information/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
                      <i class=\"material-icons mi-settings_applications\">settings_applications</i>
                      <span>
                      Advanced Parameters
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_up
                                                            </i>
              ";
        // line 1125
        echo "                              </a>
                                              <ul id=\"collapse-92\" class=\"submenu panel-collapse\">
                                                      
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"93\" id=\"subtab-AdminInformation\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/system-information/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Information
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"94\" id=\"subtab-AdminPerformance\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/performance/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Performance
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"95\" id=\"subtab-AdminAdminPreferences\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/administration/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Administration
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"96\" id=\"sub";
        // line 1154
        echo "tab-AdminEmails\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/emails/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> E-mail
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"97\" id=\"subtab-AdminImport\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/import/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Import
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"98\" id=\"subtab-AdminParentEmployees\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/employees/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Team
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"102\" id=\"subtab-AdminParentRequestSql\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/sql-requests/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Database
                                </a>
                              </li>

                                                                                  
                              
             ";
        // line 1185
        echo "                                               
                              <li class=\"link-leveltwo\" data-submenu=\"105\" id=\"subtab-AdminLogs\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/logs/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Logs
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo link-active\" data-submenu=\"106\" id=\"subtab-AdminWebservice\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/webservice-keys/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Webservice
                                </a>
                              </li>

                                                                                                                                                                                                                                                    
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"110\" id=\"subtab-AdminFeatureFlag\">
                                <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/feature-flags/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> New &amp; Experimental Features
                                </a>
                              </li>

                                                                                  
                              
                                                            
                              <li class=\"link-leveltwo\" data-submenu=\"111\" id=\"subtab-AdminParentSecurity\">
                                <a href=\"/ad";
        // line 1211
        echo "min525jetxf2fqbiknni9s/index.php/configure/advanced/security/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\"> Security
                                </a>
                              </li>

                                                                              </ul>
                                        </li>
                                              
                  
                                                      
                  
                  <li class=\"link-levelone\" data-submenu=\"162\" id=\"subtab-AdminKlaviyoPsConfig\">
                    <a href=\"http://localhost/admin525jetxf2fqbiknni9s/index.php?controller=AdminKlaviyoPsConfig&amp;token=436c2f9407b0815e9fd37c6b1daae196\" class=\"link\">
                      <i class=\"material-icons mi-trending_up\">trending_up</i>
                      <span>
                      Klaviyo
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                        </li>
                              
          
                      
                                          
                    
          
            <li class=\"category-title\" data-submenu=\"130\" id=\"tab-AdminPsdistributionapiclientCommunity\">
                <span class=\"title\">Community</span>
            </li>

                              
                  
                                                      
                  
                  <li class=\"link-levelone\" data-submenu=\"131\" id=\"subtab-AdminPsdistributionapiclient\">
                    <a href=\"/admin525jetxf2fqbiknni9s/index.php/modules/ps_distributionapiclient/top-contributors?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"link\">
             ";
        // line 1248
        echo "         <i class=\"material-icons mi-groups\">groups</i>
                      <span>
                      Wall of Fame
                      </span>
                                                    <i class=\"material-icons sub-tabs-arrow\">
                                                                    keyboard_arrow_down
                                                            </i>
                                            </a>
                                        </li>
                              
          
                  </ul>
  </div>
  
</nav>


<div class=\"header-toolbar d-print-none\">
    
  <div class=\"container-fluid\">

    
      <nav aria-label=\"Breadcrumb\">
        <ol class=\"breadcrumb\">
                      <li class=\"breadcrumb-item\">Advanced Parameters</li>
          
                      <li class=\"breadcrumb-item active\">
              <a href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/webservice-keys/?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" aria-current=\"page\">Webservice</a>
            </li>
                  </ol>
      </nav>
    

    <div class=\"title-row\">
      
          <h1 class=\"title\">
            Webservice          </h1>
      

      
        <div class=\"toolbar-icons\">
          <div class=\"wrapper\">
            
                                                          <a
                  class=\"btn btn-primary pointer\"                  id=\"page-header-desc-configuration-add\"
                  href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/webservice-keys/new?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\"                  title=\"Add new webservice key\"                                  >
                  <i class=\"material-icons\">add_circle_outline</i>                  Add new webservice key
                </a>
                                      
            
                              <a class=\"btn btn-outline-secondary btn-help btn-sidebar\" href=\"#\"
    ";
        // line 1299
        echo "               title=\"Help\"
                   data-toggle=\"sidebar\"
                   data-target=\"#right-sidebar\"
                   data-url=\"/admin525jetxf2fqbiknni9s/index.php/common/sidebar/https%253A%252F%252Fhelp.prestashop-project.org%252Fen%252Fdoc%252FAdminWebservice%253Fversion%253D8.2.6%2526country%253Den/Help?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\"
                   id=\"product_form_open_help\"
                >
                  Help
                </a>
                                    </div>
        </div>

      
    </div>
  </div>

  
  
  <div class=\"btn-floating\">
    <button class=\"btn btn-primary collapsed\" data-toggle=\"collapse\" data-target=\".btn-floating-container\" aria-expanded=\"false\">
      <i class=\"material-icons\">add</i>
    </button>
    <div class=\"btn-floating-container collapse\">
      <div class=\"btn-floating-menu\">
        
                              <a
              class=\"btn btn-floating-item   pointer\"              id=\"page-header-desc-floating-configuration-add\"
              href=\"/admin525jetxf2fqbiknni9s/index.php/configure/advanced/webservice-keys/new?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\"              title=\"Add new webservice key\"            >
              Add new webservice key
              <i class=\"material-icons\">add_circle_outline</i>            </a>
                  
                              <a class=\"btn btn-floating-item btn-help btn-sidebar\" href=\"#\"
               title=\"Help\"
               data-toggle=\"sidebar\"
               data-target=\"#right-sidebar\"
               data-url=\"/admin525jetxf2fqbiknni9s/index.php/common/sidebar/https%253A%252F%252Fhelp.prestashop-project.org%252Fen%252Fdoc%252FAdminWebservice%253Fversion%253D8.2.6%2526country%253Den/Help?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\"
            >
              Help
            </a>
                        </div>
    </div>
  </div>
  
</div>

<div id=\"main-div\">
          
      <div class=\"co";
        // line 1345
        echo "ntent-div  \">

        

                                                        
        <div id=\"ajax_confirmation\" class=\"alert alert-success\" style=\"display: none;\"></div>
<div id=\"content-message-box\"></div>


  ";
        // line 1354
        $this->displayBlock('content_header', $context, $blocks);
        $this->displayBlock('content', $context, $blocks);
        $this->displayBlock('content_footer', $context, $blocks);
        $this->displayBlock('sidebar_right', $context, $blocks);
        echo "

        

      </div>
    </div>

  <div id=\"non-responsive\" class=\"js-non-responsive\">
  <h1>Oh no!</h1>
  <p class=\"mt-3\">
    The mobile version of this page is not available yet.
  </p>
  <p class=\"mt-2\">
    Please use a desktop computer to access this page, until is adapted to mobile.
  </p>
  <p class=\"mt-2\">
    Thank you.
  </p>
  <a href=\"/admin525jetxf2fqbiknni9s/index.php/modules/pseditionbasic/homepage?_token=DLBpxKoa-hv2Nre3E_n0OtkB5-xbC3vihr4CEgvk4L0\" class=\"btn btn-primary py-1 mt-3\">
    <i class=\"material-icons rtl-flip\">arrow_back</i>
    Back
  </a>
</div>
  <div class=\"mobile-layer\"></div>

      <div id=\"footer\" class=\"bootstrap\">
    
</div>
  

      <div class=\"bootstrap\">
      
    </div>
  
";
        // line 1388
        $this->displayBlock('javascripts', $context, $blocks);
        $this->displayBlock('extra_javascripts', $context, $blocks);
        $this->displayBlock('translate_javascripts', $context, $blocks);
        echo "</body>";
        echo "
</html>";
    }

    // line 118
    public function block_stylesheets($context, array $blocks = [])
    {
        $macros = $this->macros;
    }

    public function block_extra_stylesheets($context, array $blocks = [])
    {
        $macros = $this->macros;
    }

    // line 1354
    public function block_content_header($context, array $blocks = [])
    {
        $macros = $this->macros;
    }

    public function block_content($context, array $blocks = [])
    {
        $macros = $this->macros;
    }

    public function block_content_footer($context, array $blocks = [])
    {
        $macros = $this->macros;
    }

    public function block_sidebar_right($context, array $blocks = [])
    {
        $macros = $this->macros;
    }

    // line 1388
    public function block_javascripts($context, array $blocks = [])
    {
        $macros = $this->macros;
    }

    public function block_extra_javascripts($context, array $blocks = [])
    {
        $macros = $this->macros;
    }

    public function block_translate_javascripts($context, array $blocks = [])
    {
        $macros = $this->macros;
    }

    public function getTemplateName()
    {
        return "__string_template__74795aa1c3ca8014ae46cb389630d56f";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  1565 => 1388,  1544 => 1354,  1533 => 118,  1524 => 1388,  1484 => 1354,  1473 => 1345,  1425 => 1299,  1372 => 1248,  1333 => 1211,  1305 => 1185,  1272 => 1154,  1241 => 1125,  1210 => 1096,  1178 => 1066,  1146 => 1036,  1108 => 1000,  1074 => 968,  1044 => 940,  1012 => 910,  978 => 878,  946 => 848,  914 => 818,  881 => 787,  850 => 758,  811 => 721,  780 => 692,  748 => 662,  715 => 631,  682 => 600,  650 => 570,  618 => 540,  579 => 503,  537 => 463,  507 => 435,  461 => 391,  410 => 342,  359 => 293,  313 => 249,  271 => 209,  253 => 193,  212 => 154,  171 => 118,  142 => 91,  119 => 70,  90 => 43,  46 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "__string_template__74795aa1c3ca8014ae46cb389630d56f", "");
    }
}
