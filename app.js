/**
 * @author yahuang.wu
 * @date : 2018.10.15
 * @update by: kay20475
 */

var express = require('express');
var app = express();

//启动gzip压缩
var compression = require('compression');
app.use(compression());

//操作日期的插件
var moment = require('moment');

const { Api, JsonRpc } = require('eosjs');
const ecc = require('eosjs-ecc');
const fetch = require('node-fetch');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder

const defaultPrivateKey = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3', // This is test only keys and should never be used for the production blockchain.
signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
const chainId = 'd5939d04aeea3cfa82a0d2ba341cc80f4d24781d93b1d6608b5d9afd54bfbe0a';
const api = new Api({ rpc, signatureProvider, chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

var faucetAccount = 'eosio.faucet';
var faucetPermission = 'active';

app.get('/newaccount', function (req, res) {
  // generate public and private key pair
  var privateKey = ecc.PrivateKey;
  var newAccountName = req.query.name;

  privateKey.randomKey().then(function (d) {
    var privkey = d.toWif();
    var publicKey = d.toPublic().toString();

    // create new account
    api.transact({
      actions: [{
        account: 'eosio',
        name: 'newaccount',
        authorization: [{
          actor: faucetAccount,
          permission: faucetPermission
        }],
        data: {
          creator: faucetAccount,
          name: newAccountName,
          owner: {
            threshold: 1,
            keys: [{
              key: publicKey,
              weight: 1
            }],
            accounts: [],
            waits: []
          },
          active: {
            threshold: 1,
            keys: [{
              key: publicKey,
              weight: 1
            }],
            accounts: [],
            waits: []
          },
        }         
      },{
        account: 'eosio',
        name: 'buyrambytes',
        authorization: [{
          actor: faucetAccount,
          permission: faucetPermission
          }
        ],
        data: {
          payer: faucetAccount,
          receiver: newAccountName,
          bytes: 4096
        }
      },{
        account: 'eosio',
        name: 'delegatebw',
        authorization: [{
          actor: faucetAccount,
          permission: faucetPermission
          }
        ],
        data: {
          from: faucetAccount,
          receiver: newAccountName,
          stake_net_quantity: '50.0000 MEETONE',
          stake_cpu_quantity: '50.0000 MEETONE',
          transfer: true,
        }
      }, {
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
          actor: faucetAccount,
          permission: faucetPermission
          }
        ],
        data: {
          from: faucetAccount,
          to: newAccountName,
          quantity: '900.0000 MEETONE',
          memo: 'from eosio.faucet'
        }
      }]
    },{
      blocksBehind: 3,
      expireSeconds: 60,
    }).then(function () {
      res.send({
        accountName: newAccountName,
        publicKey: publicKey,
        privateKey: privkey,
      });
    }).catch(function (result) {
      console.log(result);
      res.send(result.toString());
    })
  });
});

// get more 1000 MEETONE token
app.get('/get_token', function (req, res) {
  var newAccountName = req.query.name;

  api.transact({
    actions: [{
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{
        actor: faucetAccount,
        permission: faucetPermission
        }
      ],
      data: {
        from: faucetAccount,
        to: newAccountName,
        quantity: '1000.0000 MEETONE',
        memo: 'from eosio.faucet'
      }
    }]
  },{
    blocksBehind: 3,
    expireSeconds: 60
  }).then(function () {
    res.send({status: 'success'});
  }).catch(function (result) {
    console.log(result);
    res.send(result.toString());
  });

});

var port = 6677;
//监听端口
app.listen(port);

console.log('%s | node server initializing | listening on port %s | process id %s', moment().format('YYYY-MM-DD HH:mm:ss.SSS'), port, process.pid);
