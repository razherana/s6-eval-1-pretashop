<?php

class EntityManager_9a5be93 extends \Doctrine\ORM\EntityManager implements \ProxyManager\Proxy\VirtualProxyInterface
{
    private $valueHolderf5b98 = null;
    private $initializer0bf4a = null;
    private static $publicProperties2d10f = [
        
    ];
    public function getConnection()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getConnection', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getConnection();
    }
    public function getMetadataFactory()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getMetadataFactory', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getMetadataFactory();
    }
    public function getExpressionBuilder()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getExpressionBuilder', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getExpressionBuilder();
    }
    public function beginTransaction()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'beginTransaction', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->beginTransaction();
    }
    public function getCache()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getCache', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getCache();
    }
    public function transactional($func)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'transactional', array('func' => $func), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->transactional($func);
    }
    public function wrapInTransaction(callable $func)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'wrapInTransaction', array('func' => $func), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->wrapInTransaction($func);
    }
    public function commit()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'commit', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->commit();
    }
    public function rollback()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'rollback', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->rollback();
    }
    public function getClassMetadata($className)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getClassMetadata', array('className' => $className), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getClassMetadata($className);
    }
    public function createQuery($dql = '')
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'createQuery', array('dql' => $dql), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->createQuery($dql);
    }
    public function createNamedQuery($name)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'createNamedQuery', array('name' => $name), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->createNamedQuery($name);
    }
    public function createNativeQuery($sql, \Doctrine\ORM\Query\ResultSetMapping $rsm)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'createNativeQuery', array('sql' => $sql, 'rsm' => $rsm), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->createNativeQuery($sql, $rsm);
    }
    public function createNamedNativeQuery($name)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'createNamedNativeQuery', array('name' => $name), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->createNamedNativeQuery($name);
    }
    public function createQueryBuilder()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'createQueryBuilder', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->createQueryBuilder();
    }
    public function flush($entity = null)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'flush', array('entity' => $entity), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->flush($entity);
    }
    public function find($className, $id, $lockMode = null, $lockVersion = null)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'find', array('className' => $className, 'id' => $id, 'lockMode' => $lockMode, 'lockVersion' => $lockVersion), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->find($className, $id, $lockMode, $lockVersion);
    }
    public function getReference($entityName, $id)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getReference', array('entityName' => $entityName, 'id' => $id), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getReference($entityName, $id);
    }
    public function getPartialReference($entityName, $identifier)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getPartialReference', array('entityName' => $entityName, 'identifier' => $identifier), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getPartialReference($entityName, $identifier);
    }
    public function clear($entityName = null)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'clear', array('entityName' => $entityName), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->clear($entityName);
    }
    public function close()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'close', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->close();
    }
    public function persist($entity)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'persist', array('entity' => $entity), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->persist($entity);
    }
    public function remove($entity)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'remove', array('entity' => $entity), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->remove($entity);
    }
    public function refresh($entity)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'refresh', array('entity' => $entity), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->refresh($entity);
    }
    public function detach($entity)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'detach', array('entity' => $entity), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->detach($entity);
    }
    public function merge($entity)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'merge', array('entity' => $entity), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->merge($entity);
    }
    public function copy($entity, $deep = false)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'copy', array('entity' => $entity, 'deep' => $deep), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->copy($entity, $deep);
    }
    public function lock($entity, $lockMode, $lockVersion = null)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'lock', array('entity' => $entity, 'lockMode' => $lockMode, 'lockVersion' => $lockVersion), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->lock($entity, $lockMode, $lockVersion);
    }
    public function getRepository($entityName)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getRepository', array('entityName' => $entityName), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getRepository($entityName);
    }
    public function contains($entity)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'contains', array('entity' => $entity), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->contains($entity);
    }
    public function getEventManager()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getEventManager', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getEventManager();
    }
    public function getConfiguration()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getConfiguration', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getConfiguration();
    }
    public function isOpen()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'isOpen', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->isOpen();
    }
    public function getUnitOfWork()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getUnitOfWork', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getUnitOfWork();
    }
    public function getHydrator($hydrationMode)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getHydrator', array('hydrationMode' => $hydrationMode), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getHydrator($hydrationMode);
    }
    public function newHydrator($hydrationMode)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'newHydrator', array('hydrationMode' => $hydrationMode), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->newHydrator($hydrationMode);
    }
    public function getProxyFactory()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getProxyFactory', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getProxyFactory();
    }
    public function initializeObject($obj)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'initializeObject', array('obj' => $obj), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->initializeObject($obj);
    }
    public function getFilters()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'getFilters', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->getFilters();
    }
    public function isFiltersStateClean()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'isFiltersStateClean', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->isFiltersStateClean();
    }
    public function hasFilters()
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, 'hasFilters', array(), $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        return $this->valueHolderf5b98->hasFilters();
    }
    public static function staticProxyConstructor($initializer)
    {
        static $reflection;
        $reflection = $reflection ?? new \ReflectionClass(__CLASS__);
        $instance   = $reflection->newInstanceWithoutConstructor();
        \Closure::bind(function (\Doctrine\ORM\EntityManager $instance) {
            unset($instance->config, $instance->conn, $instance->metadataFactory, $instance->unitOfWork, $instance->eventManager, $instance->proxyFactory, $instance->repositoryFactory, $instance->expressionBuilder, $instance->closed, $instance->filterCollection, $instance->cache);
        }, $instance, 'Doctrine\\ORM\\EntityManager')->__invoke($instance);
        $instance->initializer0bf4a = $initializer;
        return $instance;
    }
    protected function __construct(\Doctrine\DBAL\Connection $conn, \Doctrine\ORM\Configuration $config, \Doctrine\Common\EventManager $eventManager)
    {
        static $reflection;
        if (! $this->valueHolderf5b98) {
            $reflection = $reflection ?? new \ReflectionClass('Doctrine\\ORM\\EntityManager');
            $this->valueHolderf5b98 = $reflection->newInstanceWithoutConstructor();
        \Closure::bind(function (\Doctrine\ORM\EntityManager $instance) {
            unset($instance->config, $instance->conn, $instance->metadataFactory, $instance->unitOfWork, $instance->eventManager, $instance->proxyFactory, $instance->repositoryFactory, $instance->expressionBuilder, $instance->closed, $instance->filterCollection, $instance->cache);
        }, $this, 'Doctrine\\ORM\\EntityManager')->__invoke($this);
        }
        $this->valueHolderf5b98->__construct($conn, $config, $eventManager);
    }
    public function & __get($name)
    {
        $this->initializer0bf4a && ($this->initializer0bf4a->__invoke($valueHolderf5b98, $this, '__get', ['name' => $name], $this->initializer0bf4a) || 1) && $this->valueHolderf5b98 = $valueHolderf5b98;
        if (isset(self::$publicProperties2d10f[$name])) {
            return $this->valueHolderf5b98->$name;
        }
        $realInstanceReflection = new \ReflectionClass('Doctrine\\ORM\\EntityManager');
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
        $realInstanceReflection = new \ReflectionClass('Doctrine\\ORM\\EntityManager');
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
        $realInstanceReflection = new \ReflectionClass('Doctrine\\ORM\\EntityManager');
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
        $realInstanceReflection = new \ReflectionClass('Doctrine\\ORM\\EntityManager');
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
        \Closure::bind(function (\Doctrine\ORM\EntityManager $instance) {
            unset($instance->config, $instance->conn, $instance->metadataFactory, $instance->unitOfWork, $instance->eventManager, $instance->proxyFactory, $instance->repositoryFactory, $instance->expressionBuilder, $instance->closed, $instance->filterCollection, $instance->cache);
        }, $this, 'Doctrine\\ORM\\EntityManager')->__invoke($this);
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
