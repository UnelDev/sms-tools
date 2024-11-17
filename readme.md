# SMS tools

## Description

SMS tools is an startpoint for suite of application for manage sms from pc with android phone

## instalation

1. Install dependencies

```
npm install
```

2. Configure environment variables

-   Create a `.env` file at the root of the project
-   Add the following environment variables:

```
GATEWAY_URL=http://phoneIP:8080
USERNAME=SMS
PASSWORD=password_on_sms_gateway
```

3. install `sms-gateway` on your phone: https://github.com/capcom6/android-sms-gateway

4. Start the server

5. register your webHook

    1. register `sms:received`

    ```bash
    curl -X POST -u <username>:<password> \
      -H "Content-Type: application/json" \
      -d '{ "id": "received", "url": "https://<serverIP>/sms", "event": "sms:received" }' \
      http://<phoneIp>/webhooks
    ```

    1. register `sms:sent`

    ```bash
    curl -X POST -u <username>:<password> \
      -H "Content-Type: application/json" \
      -d '{ "id": "sent", "url": "https://<serverIP>/sent", "event": "sms:sent" }' \
      http://<phoneIp>/webhooks
    ```

    1. register `sms:delivered`

    ```bash
    curl -X POST -u <username>:<password> \
      -H "Content-Type: application/json" \
      -d '{ "id": "delivered", "url": "https://<serverIP>/delivered", "event": "sms:delivered" }' \
      http://<phoneIp>/webhooks
    ```

    4. register `sms:failed`

    ```bash
    curl -X POST -u <username>:<password> \
      -H "Content-Type: application/json" \
      -d '{ "id": "failed", "url": "https://<serverIP>/failed", "event": "sms:failed" }' \
      http://<phoneIp>/webhooks
    ```

```
npm start
```

## Custom service

warning: if your service save data on user's aditional data field, your data must not be too large, otherwise it will slow down the database.
if you need to save large data, you must create a new table, or save it on Json file.
