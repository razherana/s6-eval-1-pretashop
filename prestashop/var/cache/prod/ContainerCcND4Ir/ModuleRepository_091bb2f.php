<?php

class ModuleRepository_091bb2f extends \PrestaShop\PrestaShop\Core\Module\ModuleRepository implements \ProxyManager\Proxy\VirtualProxyInterface
{
    private $valueHolder9dfd8 = null;
    private $initializer857b0 = null;
    private static $publicProperties20c8a = [
        
    ];
    public function getList() : \PrestaShop\PrestaShop\Core\Module\ModuleCollection
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getList', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getList();
    }
    public function getInstalledModules() : \PrestaShop\PrestaShop\Core\Module\ModuleCollection
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getInstalledModules', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getInstalledModules();
    }
    public function getMustBeConfiguredModules() : \PrestaShop\PrestaShop\Core\Module\ModuleCollection
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getMustBeConfiguredModules', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getMustBeConfiguredModules();
    }
    public function getUpgradableModules() : \PrestaShop\PrestaShop\Core\Module\ModuleCollection
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getUpgradableModules', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getUpgradableModules();
    }
    public function getModule(string $moduleName) : \PrestaShop\PrestaShop\Core\Module\ModuleInterface
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getModule', array('moduleName' => $moduleName), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getModule($moduleName);
    }
    public function getModulePath(string $moduleName) : ?string
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getModulePath', array('moduleName' => $moduleName), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getModulePath($moduleName);
    }
    public function setActionUrls(\PrestaShop\PrestaShop\Core\Module\ModuleCollection $collection) : \PrestaShop\PrestaShop\Core\Module\ModuleCollection
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'setActionUrls', array('collection' => $collection), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->setActionUrls($collection);
    }
    public function clearCache(?string $moduleName = null, bool $allShops = false) : bool
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'clearCache', array('moduleName' => $moduleName, 'allShops' => $allShops), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->clearCache($moduleName, $allShops);
    }
    public static function staticProxyConstructor($initializer)
    {
        static $reflection;
        $reflection = $reflection ?? new \ReflectionClass(__CLASS__);
        $instance   = $reflection->newInstanceWithoutConstructor();
        \Closure::bind(function (\PrestaShop\PrestaShop\Core\Module\ModuleRepository $instance) {
            unset($instance->moduleDataProvider, $instance->adminModuleDataProvider, $instance->hookManager, $instance->cacheProvider, $instance->modulePath, $instance->installedModules, $instance->modulesFromHook, $instance->contextLangId);
        }, $instance, 'PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository')->__invoke($instance);
        $instance->initializer857b0 = $initializer;
        return $instance;
    }
    public function __construct(\PrestaShop\PrestaShop\Adapter\Module\ModuleDataProvider $moduleDataProvider, \PrestaShop\PrestaShop\Adapter\Module\AdminModuleDataProvider $adminModuleDataProvider, \Doctrine\Common\Cache\CacheProvider $cacheProvider, \PrestaShop\PrestaShop\Adapter\HookManager $hookManager, string $modulePath, int $contextLangId)
    {
        static $reflection;
        if (! $this->valueHolder9dfd8) {
            $reflection = $reflection ?? new \ReflectionClass('PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository');
            $this->valueHolder9dfd8 = $reflection->newInstanceWithoutConstructor();
        \Closure::bind(function (\PrestaShop\PrestaShop\Core\Module\ModuleRepository $instance) {
            unset($instance->moduleDataProvider, $instance->adminModuleDataProvider, $instance->hookManager, $instance->cacheProvider, $instance->modulePath, $instance->installedModules, $instance->modulesFromHook, $instance->contextLangId);
        }, $this, 'PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository')->__invoke($this);
        }
        $this->valueHolder9dfd8->__construct($moduleDataProvider, $adminModuleDataProvider, $cacheProvider, $hookManager, $modulePath, $contextLangId);
    }
    public function & __get($name)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, '__get', ['name' => $name], $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        if (isset(self::$publicProperties20c8a[$name])) {
            return $this->valueHolder9dfd8->$name;
        }
        $realInstanceReflection = new \ReflectionClass('PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository');
        if (! $realInstanceReflection->hasProperty($name)) {
            $targetObject = $this->valueHolder9dfd8;
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
        $targetObject = $this->valueHolder9dfd8;
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
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, '__set', array('name' => $name, 'value' => $value), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        $realInstanceReflection = new \ReflectionClass('PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository');
        if (! $realInstanceReflection->hasProperty($name)) {
            $targetObject = $this->valueHolder9dfd8;
            $targetObject->$name = $value;
            return $targetObject->$name;
        }
        $targetObject = $this->valueHolder9dfd8;
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
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, '__isset', array('name' => $name), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        $realInstanceReflection = new \ReflectionClass('PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository');
        if (! $realInstanceReflection->hasProperty($name)) {
            $targetObject = $this->valueHolder9dfd8;
            return isset($targetObject->$name);
        }
        $targetObject = $this->valueHolder9dfd8;
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
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, '__unset', array('name' => $name), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        $realInstanceReflection = new \ReflectionClass('PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository');
        if (! $realInstanceReflection->hasProperty($name)) {
            $targetObject = $this->valueHolder9dfd8;
            unset($targetObject->$name);
            return;
        }
        $targetObject = $this->valueHolder9dfd8;
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
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, '__clone', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        $this->valueHolder9dfd8 = clone $this->valueHolder9dfd8;
    }
    public function __sleep()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, '__sleep', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return array('valueHolder9dfd8');
    }
    public function __wakeup()
    {
        \Closure::bind(function (\PrestaShop\PrestaShop\Core\Module\ModuleRepository $instance) {
            unset($instance->moduleDataProvider, $instance->adminModuleDataProvider, $instance->hookManager, $instance->cacheProvider, $instance->modulePath, $instance->installedModules, $instance->modulesFromHook, $instance->contextLangId);
        }, $this, 'PrestaShop\\PrestaShop\\Core\\Module\\ModuleRepository')->__invoke($this);
    }
    public function setProxyInitializer(\Closure $initializer = null) : void
    {
        $this->initializer857b0 = $initializer;
    }
    public function getProxyInitializer() : ?\Closure
    {
        return $this->initializer857b0;
    }
    public function initializeProxy() : bool
    {
        return $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'initializeProxy', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
    }
    public function isProxyInitialized() : bool
    {
        return null !== $this->valueHolder9dfd8;
    }
    public function getWrappedValueHolderValue()
    {
        return $this->valueHolder9dfd8;
    }
}
