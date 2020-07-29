# Project LATA - Server

API based server built using Node.js.

Base url: https://projectlata.heroku.com/

## Functions
1. API to validate instance
2. Save readings
3. Get commands for specific instance
4. Download Board definitions by API

## API
### 1. Get definitions
#### API URL
POST /dev

#### Query Parameters
```
reqType=get-defs
```

#### Request body:
```
{
    "instanceId":"your-instanceId"
}
```

### 2. Get commands
#### API URL
POST /dev

#### Query Parameters
```
reqType=get-cmds
```

#### Request body:
```
{
    "instanceId":"your-instanceId"
}
```
### 3. Set readings
#### API URL
POST /dev

#### Query Parameters
```
reqType=set-readings
```

#### Request body:
```
{
    "instanceId":"your-instanceId",
    "value":1.0,
    "pinNo:"A0"
}
```