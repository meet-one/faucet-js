# faucet-js


## install

```
cd faucet-js
npm i -d
```

## Start

```
node app.js
```

## Start with PM2

```
npm install --D; NODE_ENV=production PORT=6677 pm2 start process.json --only node-faucet-production
```

## Test

```
curl http://127.0.0.1:6677/newaccount?name=testnet11111
```