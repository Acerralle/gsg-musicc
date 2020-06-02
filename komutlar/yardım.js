const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

let botid = ('717364330957373511') //bu yere botun id'sini yapıştırın.
//eğer botunuz dbl(discord bot list) de yoksa Bota Oy Ver (Vote) olmucaktır.

exports.run = (client, message, args) => {
    const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} `, client.user.avatarURL)
        .setColor('0x006400')
        .setTitle(`${client.user.username} - RGS Music BOT:`)
        .setDescription(`
:small_orange_diamond: |  **${ayarlar.prefix}play ** Пускане на песен.\n
:small_orange_diamond: |  **${ayarlar.prefix}pause ** Паузиране на песен.\n 
:small_orange_diamond: |  **${ayarlar.prefix}skip ** Преминаване към следващата песен.\n 
:small_orange_diamond: |  **${ayarlar.prefix}volume ** Определяне на нивото на звука.\n 
:small_orange_diamond: |  **${ayarlar.prefix}queue ** Показване на песните в опашката.\n 
:small_orange_diamond: |  **${ayarlar.prefix}resume ** Възпроизвеждане на паузираната песен.\n 
:small_orange_diamond: |  **${ayarlar.prefix}music ** Показване на текущата песен.\n 
:small_orange_diamond: |  **${ayarlar.prefix}stop ** Спиране на всички песни.\n\n`)
    


        .setThumbnail(client.user.avatarURL)
        .addField(`» GSG`, `100% Български Музикален БОТ!`)
        .setFooter(`${message.author.username} `, message.author.avatarURL)
    return message.channel.sendEmbed(embed);
  
  
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['help'],
  permLevel: 0,
};
exports.help = {
  name: "_help",
  description: "Показва командите на БОТА..",
  usage: "_help"
};