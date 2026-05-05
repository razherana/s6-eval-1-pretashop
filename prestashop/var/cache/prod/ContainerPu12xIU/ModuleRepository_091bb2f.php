<?php

class ModuleRepository_091bb2f extends \PrestaShop\PrestaShop\Core\Module\ModuleRepository implements \ProxyManager\Proxy\VirtualProxyInterface
{
    private $valueHolderf5b98 = null;
    private $initializer0bf4a = null;
    private static $publicProperties2d10f = [
        
    ];
    public function getList() : \PrestaShop\PrestaShop\Core\Module\ModuleCollection
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getList', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getList();
    }
    public function getInstalledModules() : \PrestaShop\PrestaShop\Core\Module\ModuleCollection
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getInstalledModules', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getInstalledModules();
    }
    public function getMustBeConfiguredModules() : \PrestaShop\PrestaShop\Core\Module\ModuleCollection
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getMustBeConfiguredModules', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getMustBeConfiguredModules();
    }
    public function getUpgradableModules() : \PrestaShop\PrestaShop\Core\Module\ModuleCollection
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getUpgradableModules', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getUpgradableModules();
    }
    public function getModule(string $moduleName) : \PrestaShop\PrestaShop\Core\Module\ModuleInterface
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getModule', array('moduleName' => $moduleName), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getModule($moduleName);
    }
    public function getModulePath(string $moduleName) : ?string
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getModulePath', array('moduleName' => $moduleName), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getModulePath($moduleName);
    }
    public function setActionUrls(\PrestaShop\PrestaShop\Core\Module\ModuleCollection $collection) : \PrestaShop\PrestaShop\Core\Module\ModuleCollection
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'setActionUrls', array('collection' => $collection), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->setActionUrls($collection);
    }
    public function clearCache(?string $moduleName = null, bool $allShops = false) : bool
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'clearCache', array('moduleName' => $moduleName, 'allShops' => $allShops), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->clearCache($moduleName, $allShops);
    }
    public static function staticProxyConstructor($initializer)
    {
        static $reflection;
        $reflection = $reflection ?? new \ReflectionClass(__CLASS__);
        $instance   = $reflection->newInstanceWithoutConstructor();
        \Closure::bind(function (\PrestaShop\PrestaShop\Core\Module\ModuleRepository $instance) {
            unset($instance->moduleDataProvider, $instance->adminModuleDataProvider, $instance->hookManager, $instance->cacheProvider, $instance->modulePath, $instance->installedModules, $instance->modulesFromHook, $instance->contextLangId);
        }, $instance, 'PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository')->__invoke($instance);
        $instance->initializer0bf4a = $initializer;
        return $instance;
    }
    public function __construct(\PrestaShop\PrestaShop\Adapter\Module\ModuleDataProvider $moduleDataProvider, \PrestaShop\PrestaShop\Adapter\Module\AdminModuleDataProvider $adminModuleDataProvider, \Doctrine\Common\Cache\CacheProvider $cacheProvider, \PrestaShop\PrestaShop\Adapter\HookManager $hookManager, string $modulePath, int $contextLangId)
    {
        static $reflection;
        if (! $this->valueHolderf5b98) {
            $reflection = $reflection ?? new \ReflectionClass('PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository');
            $this->valueHolderf5b98 = $reflection->newInstanceWithoutConstructor();
        \Closure::bind(function (\PrestaShop\PrestaShop\Core\Module\ModuleRepository $instance) {
            unset($instance->moduleDataProvider, $instance->adminModuleDataProvider, $instance->hookManager, $instance->cacheProvider, $instance->modulePath, $instance->installedModules, $instance->modulesFromHook, $instance->contextLangId);
        }, $this, 'PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository')->__invoke($this);
        }
        $this->valueHolderf5b98->__construct($moduleDataProvider, $adminModuleDataProvider, $cacheProvider, $hookManager, $modulePath, $contextLangId);
    }
    public function & __get($name)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, '__get', ['name' => $name], $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        if (isset(self::$publicProperties2d10f[$name])) {
            return $this->valueHolderf5b98->$name;
        }
        $realInstanceReflection = new \ReflectionClass('PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository');
        if (! $realInstanceReflection->hasProperty($name)) {
            $targetObject = $this->valueHolderf5b98;
            $backtrace = debug_backtrace(false, 1);
            trigger_error(
                sprintf(
                    'Undefined property: %s::$%s in %s on line %s',
                    $realInstanceReflection->getName(),
                    $name,
                    $backtrace[0]['file'],
                    $backtrace[0]['line']
                ),
                \E_USER_NOTICE
            );
            return $targetObject->$name;
        }
        $targetObject = $this->valueHolderf5b98;
        $accessor = function & () use ($targetObject, $name) {
            return $targetObject->$name;
        };
        $backtrace = debug_backtrace(true, 2);
        $scopeObject = isset($backtrace[1]['object']) ? $backtrace[1]['object'] : new \ProxyManager\Stub\EmptyClassStub();
        $accessor = $accessor->bindTo($scopeObject, get_class($scopeObject));
        $returnValue = & $accessor();
        return $returnValue;
    }
    public function __set($name, $value)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, '__set', array('name' => $name, 'value' => $value), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        $realInstanceReflection = new \ReflectionClass('PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository');
        if (! $realInstanceReflection->hasProperty($name)) {
            $targetObject = $this->valueHolderf5b98;
            $targetObject->$name = $value;
            return $targetObject->$name;
        }
        $targetObject = $this->valueHolderf5b98;
        $accessor = function & () use ($targetObject, $name, $value) {
            $targetObject->$name = $value;
            return $targetObject->$name;
        };
        $backtrace = debug_backtrace(true, 2);
        $scopeObject = isset($backtrace[1]['object']) ? $backtrace[1]['object'] : new \ProxyManager\Stub\EmptyClassStub();
        $accessor = $accessor->bindTo($scopeObject, get_class($scopeObject));
        $returnValue = & $accessor();
        return $returnValue;
    }
    public function __isset($name)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, '__isset', array('name' => $name), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        $realInstanceReflection = new \ReflectionClass('PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository');
        if (! $realInstanceReflection->hasProperty($name)) {
            $targetObject = $this->valueHolderf5b98;
            return isset($targetObject->$name);
        }
        $targetObject = $this->valueHolderf5b98;
        $accessor = function () use ($targetObject, $name) {
            return isset($targetObject->$name);
        };
        $backtrace = debug_backtrace(true, 2);
        $scopeObject = isset($backtrace[1]['object']) ? $backtrace[1]['object'] : new \ProxyManager\Stub\EmptyClassStub();
        $accessor = $accessor->bindTo($scopeObject, get_class($scopeObject));
        $returnValue = $accessor();
        return $returnValue;
    }
    public function __unset($name)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, '__unset', array('name' => $name), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        $realInstanceReflection = new \ReflectionClass('PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository');
        if (! $realInstanceReflection->hasProperty($name)) {
            $targetObject = $this->valueHolderf5b98;
            unset($targetObject->$name);
            return;
        }
        $targetObject = $this->valueHolderf5b98;
        $accessor = function () use ($targetObject, $name) {
            unset($targetObject->$name);
            return;
        };
        $backtrace = debug_backtrace(true, 2);
        $scopeObject = isset($backtrace[1]['object']) ? $backtrace[1]['object'] : new \ProxyManager\Stub\EmptyClassStub();
        $accessor = $accessor->bindTo($scopeObject, get_class($scopeObject));
        $accessor();
    }
    public function __clone()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, '__clone', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        $this->valueHolderf5b98 = clone $this->valueHolderf5b98;
    }
    public function __sleep()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, '__sleep', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return array('valueHolderf5b98');
    }
    public function __wakeup()
    {
        \Closure::bind(function (\PrestaShop\PrestaShop\Core\Module\ModuleRepository $instance) {
            unset($instance->moduleDataProvider, $instance->adminModuleDataProvider, $instance->hookManager, $instance->cacheProvider, $instance->modulePath, $instance->installedModules, $instance->modulesFromHook, $instance->contextLangId);
        }, $this, 'PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository')->__invoke($this);
    }
    public function setProxyInitializer(\Closure $initializer = null) : void
    {
        $this->initializer0bf4a = $initializer;
    }
    public function getProxyInitializer() : ?\Closure
    {
        return $this->initializer0bf4a;
    }
    public function initializeProxy() : bool
    {
        return $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'initializeProxy', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
    }
    public function isProxyInitialized() : bool
    {
        return null !== $this->valueHolderf5b98;
    }
    public function getWrappedValueHolderValue()
    {
        return $this->valueHolderf5b98;
    }
}
