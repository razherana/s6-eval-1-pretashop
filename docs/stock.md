# Stock management

You can update the available quantities by sending a PATCH request to `/api/stock_availables/{{id}}` (with {{id}} the previously retrieved stock_available entity id).

In this example, the returned stock_available entity id was: 67.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
    <stock_available>
        <id><![CDATA[67]]></id>
        <quantity><![CDATA[10]]></quantity>
    </stock_available>
</prestashop>
```

It will generate all necessary updates in the database (stock_movements, etc.), and the new quantity will be 10.
