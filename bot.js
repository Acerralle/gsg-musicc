const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
var Jimp = require('jimp');
const { Client, Util } = require('discord.js');
const weather = require('weather-js')
const fs = require('fs');
const db = require('quick.db');
const http = require('http');
const express = require('express');
require('./util/eventLoader')(client);
const path = require('path');
const request = require('request');
const snekfetch = require('snekfetch');
const queue = new Map();
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

let owner = `${ayarlar.sahip}`;

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};


client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id == ayarlar.sahipbir) permlvl = 4
  if (message.author.id == ayarlar.sahipiki) permlvl = 4
  if (message.author.id == ayarlar.sahipuc) permlvl = 4
  return permlvl;
};

client.login(ayarlar.token);








const youTube = require('simple-youtube-api');
const Ytdl = require('ytdl-core');
const youtube = new YouTube('AIzaSyBzDHZw61q8aOYglO0dW4p9OvOlBqibQWs');
const Queue = new Map();
var prefix = ayarlar.prefix;

client.on("message", async message => {
  var args = message.content.substring(prefix.length).split(" ");
    if (!message.content.startsWith(prefix)) return;
  var searchString = args.slice(1).join(' ');
  var url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
  var serverQueue = queue.get(message.guild.id);
    switch (args[0].toLowerCase()) {
      case "play":
    var voiceChannel = message.member.voiceChannel;
    const voiceChannelAdd = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Грешка`)
    .setDescription(`За да използваш бота трябва да сте в стая.`)
    if (!voiceChannel) return message.channel.send(voiceChannelAdd);
    var permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) {
      const warningErr = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`Грешка`)
      .setDescription(`Ботът няма права.`)
      return message.channel.send(warningErr);
    }
    if (!permissions.has('SPEAK')) {
      const musicErr = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`Грешка`)
      .setDescription(`Ботът няма права.`)
      return message.channel.send(musicErr);
    }
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      var playlist = await youtube.getPlaylist(url);
      var videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        var video2 = await youtube.getVideoByID(video.id);
        await handleVideo(video2, message, voiceChannel, true);
      }
      const PlayingListAdd = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`Опашка:`)
      .setDescription(`? **${playlist.title}** Песента е добавена към опашката.`)
      return message.channel.send(PlayingListAdd);
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          var index = 0;
          const embed = new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle(`___**Избиране на песен**___`)
          .setDescription(`${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')} \n\n**За да избере песен въведете в чата цифрите между \`1\` и \`10\` **`)
          .setFooter(` Изборът на песента ще бъде отменен след "10" секунди.`)
          message.channel.send({embed})
          try {
            var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
              maxMatches: 1,
              time: 10000,
              errors: ['time']
            });
          } catch (err) {
            console.error(err);
            const NoNumber = new Discord.RichEmbed()
            .setColor("RANDOM")
            .setTitle(`Грешка`)
            .setDescription(`Грешка`) 
            return message.channel.send(NoNumber);
          }
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          const songNope = new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle(`Грешка`)
          .setDescription(`Песента не е намерена.`) 
          return message.channel.send(songNope);
        }
      }
      return handleVideo(video, message, voiceChannel);
    }
    break;
      case "skip":
      const err0 = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`Грешка`)
      .setDescription(`За да използваш бота трябва да сте в стая.`) 
    if (!message.member.voiceChannel) return message.channel.send(err0);
    const err05 = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Грешка`)
    .setDescription(`В момента не се изпълнява песен.`)
    if (!serverQueue) return message.channel.send(err05);
    const songSkip = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Преминаване към друга песен...`)
    .setDescription(`Премината към друга песен. <a:oke:533358941632069652> `)
    serverQueue.connection.dispatcher.end('g');
    message.channel.send(songSkip)
    return undefined;
break;
      case "stop":
    const err1 = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Грешка`)
    .setDescription(`За да използваш бота трябва да сте в стая.`)  
    if (!message.member.voiceChannel) return message.channel.send(err1);
    const err2 = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Грешка`)
    .setDescription(`В момента не се изпълнява песен.`)
    if (!serverQueue) return message.channel.send(err2);
    serverQueue.songs = [];
    const songEnd = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Спиране на песента <a:oke:533358941632069652>`)
    .setDescription(`Песента е спряна.`)
    serverQueue.connection.dispatcher.end('d');
    message.channel.send(songEnd)
    return undefined;
break;
      case "volume":
      const asd1 = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`Грешка`)
      .setDescription(`За да използваш бота трябва да сте в стая.`)  
    if (!message.member.voiceChannel) return message.channel.send(asd1);
    const asd2 = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Грешка`)
    .setDescription(`В момента не се изпълнява песен.`)
    if (!serverQueue) return message.channel.send(asd2);
    
    let number = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"]
    const yaziolmazamk = new Discord.RichEmbed ()
    .setColor ("RANDOM")
    .setTitle ('HATA')
    .setDescription('Ses Seviyesi Sayı olmalıdır')
  //  if (!args[1] === number) return message.channel.send (yaziolmazamk)
    const volumeLevel = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Сила на звука`)
    .setDescription(`В момента силата на звука е: **${serverQueue.volume}**`)
    if(!args [1] === number) return;
    if (!args[1]) return message.channel.send(volumeLevel);
    serverQueue.volume = args[1];
    if (args[1] > 15) return message.channel.send(`Максимумът за силата на звука е \`15\``)
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
    const volumeLevelEdit = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Сила на звука`)
    .setDescription(`Сила на звука е: **${args[1]}** <a:oke:533358941632069652>`)
    return message.channel.send(volumeLevelEdit);
break;
      case "music":
    if (!serverQueue) return message.channel.send('Hiçbirşey Çalmıyor');
		return message.channel.send(`?? В момента се изпълнява: **${serverQueue.songs[0].title}**`);
break;
      case "queue":
      var siralama = 0;
    if (!serverQueue) return message.channel.send('Şuanda herhangi bir şarkı çalmıyor.');
    const songList10 = new Discord.RichEmbed()
    .setColor("RANDOM")
    .addField(`?? | В момента се изпълнява`, `${serverQueue.songs[0].title}`)
    .addField(`? | Опашка`, `${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}`)
    return message.channel.send(songList10);
break;
case "pause":
      if (serverQueue && serverQueue.playing) {
        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause();
        const asjdhsaasjdha = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Спиране на песента`)
    .setDescription(`Песента е спряна!`)
      return message.channel.send(asjdhsaasjdha);
    }
    return message.channel.send('В момента не се изпълнява песен.');
break;
      case "resume":
      if (serverQueue && !serverQueue.playing) {
        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        const asjdhsaasjdhaadssad = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Песента се възпроизвежда <a:oke:533358941632069652>`)
    .setDescription(`Песента се възпроизвежда...`)
      return message.channel.send(asjdhsaasjdhaadssad);
    }
    return message.channel.send('В момента не се изпълнява песен.');
  
  return undefined;
break;
}
async function handleVideo(video, message, voiceChannel, playlist = false) {
  var serverQueue = queue.get(message.guild.id);
  //console.log(video);
  var song = {
    id: video.id,
    title: video.title,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
    requester: message.author.id,
  };
  if (!serverQueue) {
    var queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };
    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);
    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0]);
    } catch (error) {
      console.error(`Бота не успя да се свърже към канала Грешка: ${error}`);
      queue.delete(message.guild.id);
      return message.channel.send(`Бота не успя да се свърже към канала Грешка: ${error}`);
    }
  } else {
    serverQueue.songs.push(song);
    //console.log(serverQueue.songs);
    if (playlist) return undefined;
    const songListBed = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Добавено към опашката`)
    .setDescription(`**${song.title}** песен е добавена към опашката. <a:oke:533358941632069652>`)
    return message.channel.send(songListBed);
  }
  return undefined;
}
  function play(guild, song) {
  var serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  //console.log(serverQueue.songs);
  const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
    .on('end', reason => {
      /*if (reason === 'İnternetten kaynaklı bir sorun yüzünden şarkılar kapatıldı.');
      else console.log(reason);*/
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    
  const playingBed = new Discord.RichEmbed()
  .setColor("RANDOM")
  .setAuthor(` Песента се пуска...`, `http://icons.iconarchive.com/icons/dakirby309/simply-styled/256/YouTube-icon.png`)
  .setDescription(`[${song.title}](${song.url})[<@${song.requester}>]`)
  serverQueue.textChannel.send(playingBed);
}
}); 