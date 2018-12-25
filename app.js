/**
 * @author yahuang.wu
 * @date : 2018.10.15
 */

var express = require('express');
var app = express();

//启动gzip压缩
var compression = require('compression');
app.use(compression());

//操作日期的插件
var moment = require('moment');

Eos = require('eosjs');
config = {
  chainId: 'd5939d04aeea3cfa82a0d2ba341cc80f4d24781d93b1d6608b5d9afd54bfbe0a',
  keyProvider: '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3', // This is test only keys and should never be used for the production blockchain.
  httpEndpoint: 'http://127.0.0.1:8888',
  expireInSeconds: 60,
  broadcast: true,
  verbose: false, // API activity
  sign: true
};

var faucetAccount = 'eosio.faucet';

eos = Eos(config);

app.get('/newaccount', function (req, res) {
  // generate public and private key pair
  var PrivateKey = Eos.modules.ecc.PrivateKey;
  var newAccountName = req.query.name;

  PrivateKey.randomKey().then(function (d) {
    var privkey = d.toWif();
    var publicKey = d.toPublic().toString();

    // create new account
    eos.transaction(function (tr) {
      tr.newaccount({
        creator: faucetAccount,
        name: newAccountName,
        owner: publicKey,
        active: publicKey
      });

      tr.buyrambytes({
        payer: faucetAccount,
        receiver: newAccountName,
        bytes: 4096
      });

      tr.delegatebw({
        from: faucetAccount,
        receiver: newAccountName,
        stake_net_quantity: '50.0000 MEETONE',
        stake_cpu_quantity: '50.0000 MEETONE',
        transfer: 1
      });

      tr.transfer({
        from: faucetAccount,
        to: newAccountName,
        quantity: "900.0000 MEETONE",
        memo: "from eosio.faucet"
      });
    }).then(function () {
      res.send({
        accountName: newAccountName,
        publicKey: publicKey,
        privateKey: privkey,
      });
    }).catch(function (result) {
      console.log(result);
      res.send(result.toString());
    });

  });
});

// get more 1000 MEETONE token
app.get('/get_token', function (req, res) {
  var newAccountName = req.query.name;

  eos.transaction(function (tr) {
    tr.transfer({
      from: faucetAccount,
      to: newAccountName,
      quantity: "1000.0000 MEETONE",
      memo: "from eosio.faucet"
    });
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
