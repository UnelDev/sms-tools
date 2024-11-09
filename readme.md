# SMS tools

## Description

SMS tools is an startpoint for suite of application for manage sms from pc with android phone

## instalation

1. Install dependencies

```
npm install
```

2. Configure environment variables

- Create a `.env` file at the root of the project
- Add the following environment variables:

```
GATEWAY_URL=http://phoneIP:8080
USERNAME=SMS
PASSWORD=password_on_sms_gateway
```

3. install `sms-gateway` on your phone: https://github.com/capcom6/android-sms-gateway
4. Start the server

```
npm start
```