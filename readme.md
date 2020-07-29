#Project LATA - Server

API based server built using Node.js.

Base url: https://projectlata.heroku.com/

## Functions
1. API to validate instance
2. Save readings
3. Get commands for specific instance
4. Download Board definitions by API


## Get definitions

### Query Parameters
```
reqType=get-defs
```

### Request body:
```
{
    "instanceId":"your-instanceId"
}
```
