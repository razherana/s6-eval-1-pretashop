<?php

use Symfony\Component\Translation\MessageCatalogue;

$catalogue = new MessageCatalogue('mg-MG', array (
));

$catalogueMg = new MessageCatalogue('mg', array (
));
$catalogue->addFallbackCatalogue($catalogueMg);

return $catalogue;
