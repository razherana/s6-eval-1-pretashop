<?php

class EntityManager_9a5be93 extends \Doctrine\ORM\EntityManager implements \ProxyManager\Proxy\VirtualProxyInterface
{
    private $valueHolder9dfd8 = null;
    private $initializer857b0 = null;
    private static $publicProperties20c8a = [
        
    ];
    public function getConnection()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getConnection', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getConnection();
    }
    public function getMetadataFactory()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getMetadataFactory', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getMetadataFactory();
    }
    public function getExpressionBuilder()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getExpressionBuilder', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getExpressionBuilder();
    }
    public function beginTransaction()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'beginTransaction', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->beginTransaction();
    }
    public function getCache()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getCache', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getCache();
    }
    public function transactional($func)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'transactional', array('func' => $func), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->transactional($func);
    }
    public function wrapInTransaction(callable $func)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'wrapInTransaction', array('func' => $func), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->wrapInTransaction($func);
    }
    public function commit()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'commit', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->commit();
    }
    public function rollback()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'rollback', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->rollback();
    }
    public function getClassMetadata($className)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getClassMetadata', array('className' => $className), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getClassMetadata($className);
    }
    public function createQuery($dql = '')
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'createQuery', array('dql' => $dql), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->createQuery($dql);
    }
    public function createNamedQuery($name)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'createNamedQuery', array('name' => $name), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->createNamedQuery($name);
    }
    public function createNativeQuery($sql, \Doctrine\ORM\Query\ResultSetMapping $rsm)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'createNativeQuery', array('sql' => $sql, 'rsm' => $rsm), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->createNativeQuery($sql, $rsm);
    }
    public function createNamedNativeQuery($name)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'createNamedNativeQuery', array('name' => $name), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->createNamedNativeQuery($name);
    }
    public function createQueryBuilder()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'createQueryBuilder', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->createQueryBuilder();
    }
    public function flush($entity = null)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'flush', array('entity' => $entity), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->flush($entity);
    }
    public function find($className, $id, $lockMode = null, $lockVersion = null)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'find', array('className' => $className, 'id' => $id, 'lockMode' => $lockMode, 'lockVersion' => $lockVersion), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->find($className, $id, $lockMode, $lockVersion);
    }
    public function getReference($entityName, $id)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getReference', array('entityName' => $entityName, 'id' => $id), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getReference($entityName, $id);
    }
    public function getPartialReference($entityName, $identifier)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getPartialReference', array('entityName' => $entityName, 'identifier' => $identifier), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getPartialReference($entityName, $identifier);
    }
    public function clear($entityName = null)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'clear', array('entityName' => $entityName), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->clear($entityName);
    }
    public function close()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'close', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->close();
    }
    public function persist($entity)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'persist', array('entity' => $entity), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->persist($entity);
    }
    public function remove($entity)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'remove', array('entity' => $entity), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->remove($entity);
    }
    public function refresh($entity)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'refresh', array('entity' => $entity), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->refresh($entity);
    }
    public function detach($entity)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'detach', array('entity' => $entity), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->detach($entity);
    }
    public function merge($entity)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'merge', array('entity' => $entity), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->merge($entity);
    }
    public function copy($entity, $deep = false)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'copy', array('entity' => $entity, 'deep' => $deep), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->copy($entity, $deep);
    }
    public function lock($entity, $lockMode, $lockVersion = null)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'lock', array('entity' => $entity, 'lockMode' => $lockMode, 'lockVersion' => $lockVersion), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->lock($entity, $lockMode, $lockVersion);
    }
    public function getRepository($entityName)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getRepository', array('entityName' => $entityName), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getRepository($entityName);
    }
    public function contains($entity)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'contains', array('entity' => $entity), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->contains($entity);
    }
    public function getEventManager()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getEventManager', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getEventManager();
    }
    public function getConfiguration()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getConfiguration', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getConfiguration();
    }
    public function isOpen()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'isOpen', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->isOpen();
    }
    public function getUnitOfWork()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getUnitOfWork', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getUnitOfWork();
    }
    public function getHydrator($hydrationMode)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getHydrator', array('hydrationMode' => $hydrationMode), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getHydrator($hydrationMode);
    }
    public function newHydrator($hydrationMode)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'newHydrator', array('hydrationMode' => $hydrationMode), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->newHydrator($hydrationMode);
    }
    public function getProxyFactory()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getProxyFactory', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getProxyFactory();
    }
    public function initializeObject($obj)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'initializeObject', array('obj' => $obj), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->initializeObject($obj);
    }
    public function getFilters()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'getFilters', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->getFilters();
    }
    public function isFiltersStateClean()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'isFiltersStateClean', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->isFiltersStateClean();
    }
    public function hasFilters()
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, 'hasFilters', array(), $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        return $this->valueHolder9dfd8->hasFilters();
    }
    public static function staticProxyConstructor($initializer)
    {
        static $reflection;
        $reflection = $reflection ?? new \ReflectionClass(__CLASS__);
        $instance   = $reflection->newInstanceWithoutConstructor();
        \Closure::bind(function (\Doctrine\ORM\EntityManager $instance) {
            unset($instance->config, $instance->conn, $instance->metadataFactory, $instance->unitOfWork, $instance->eventManager, $instance->proxyFactory, $instance->repositoryFactory, $instance->expressionBuilder, $instance->closed, $instance->filterCollection, $instance->cache);
        }, $instance, 'Doctrine\\ORM\\EntityManager')->__invoke($instance);
        $instance->initializer857b0 = $initializer;
        return $instance;
    }
    protected function __construct(\Doctrine\DBAL\Connection $conn, \Doctrine\ORM\Configuration $config, \Doctrine\Common\EventManager $eventManager)
    {
        static $reflection;
        if (! $this->valueHolder9dfd8) {
            $reflection = $reflection ?? new \ReflectionClass('Doctrine\\ORM\\EntityManager');
            $this->valueHolder9dfd8 = $reflection->newInstanceWithoutConstructor();
        \Closure::bind(function (\Doctrine\ORM\EntityManager $instance) {
            unset($instance->config, $instance->conn, $instance->metadataFactory, $instance->unitOfWork, $instance->eventManager, $instance->proxyFactory, $instance->repositoryFactory, $instance->expressionBuilder, $instance->closed, $instance->filterCollection, $instance->cache);
        }, $this, 'Doctrine\\ORM\\EntityManager')->__invoke($this);
        }
        $this->valueHolder9dfd8->__construct($conn, $config, $eventManager);
    }
    public function & __get($name)
    {
        $this->initializer857b0 && ($this->initializer857b0->__invoke($valueHolder9dfd8, $this, '__get', ['name' => $name], $this->initializer857b0) || 1) && $this->valueHolder9dfd8 = $valueHolder9dfd8;
        if (isset(self::$publicProperties20c8a[$name])) {
            return $this->valueHolder9dfd8->$name;
        }
        $realInstanceReflection = new \ReflectionClass('Doctrine\\ORM\\EntityManager');
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
        $realInstanceReflection = new \ReflectionClass('Doctrine\\ORM\\EntityManager');
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
        $realInstanceReflection = new \ReflectionClass('Doctrine\\ORM\\EntityManager');
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
        $realInstanceReflection = new \ReflectionClass('Doctrine\\ORM\\EntityManager');
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
        \Closure::bind(function (\Doctrine\ORM\EntityManager $instance) {
            unset($instance->config, $instance->conn, $instance->metadataFactory, $instance->unitOfWork, $instance->eventManager, $instance->proxyFactory, $instance->repositoryFactory, $instance->expressionBuilder, $instance->closed, $instance->filterCollection, $instance->cache);
        }, $this, 'Doctrine\\ORM\\EntityManager')->__invoke($this);
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
