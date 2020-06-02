const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

var prefix = ayarlar.prefix; "!"

module.exports = client => {
console.log('>> Готово. <<');
console.log('>> Готово! <<');
  client.user.setStatus("Активен");
   var oyun = [
"🔥 GSG Music BOT 🔥 ", 
"🔥 100% Български Музикален БОТ! 🔥" 

    ];

    setInterval(function() {

        var random = Math.floor(Math.random()*(oyun.length-0+1)+0);

        client.user.setGame(oyun[random], "100% Български Музикален БОТ");
        }, 5000);
}
//

