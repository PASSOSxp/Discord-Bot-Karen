/* Mantendo o bot online */

const express = require('express');
const app = express();
app.get("/", (request, response) => {
  const ping = new Date();
  ping.setHours(ping.getHours() - 3);
  console.log(`Ping received at ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`);
  response.sendStatus(200);
});
app.listen(process.env.PORT);


/* Conectando o bot ao Discord */

const Discord = require("discord.js")
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})


// at the top of your file
const { MessageEmbed } = require('discord.js');


/* Agenda */

var comp1 = ""
var comp2 = ""
var comp3 = ""


/* Prefixo do bot */

const prefix = "!k "


/* Mensagens */

client.on("messageCreate", msg => {

  
  /* Ignoradas */

  if (msg.author.bot) return

  
  /* Executadas */
  
  if (msg.content ===  prefix + "help"){
    // inside a command, event listener, etc.
    const exampleEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Você precisa de ajuda?')
      .setURL('https://github.com/PASSOSxp')
      .setAuthor({ name: `${client.user.tag}`, iconURL: client.user.displayAvatarURL(), url: 'https://github.com/PASSOSxp' })
      .setDescription('Principais comandos:')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: prefix + 'agenda', value: 'Exibe o que há na Agenda' },
        { name: prefix + 'agendar', value: 'Marca algo na Agenda' },
        { name: prefix + 'resetagenda', value: 'Reseta a Agenda' },
        { name: prefix + 'play', value: 'Toca uma música' },
        { name: prefix + 'stop', value: 'Para a música' },
        { name: prefix + 'skip', value: 'Pula a música' },
        { name: prefix + 'help', value: 'Exibe todos os comandos' },
        { name: '\u200B', value: '\u200B' }/*,
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true },
      */)
      /* .addField('Inline field title', 'Some value here', true)
      .setImage('') */
      .setTimestamp()
      .setFooter({ text: `${client.user.tag}`, iconURL: client.user.displayAvatarURL() });
    msg.channel.send({ embeds: [exampleEmbed] });
  }
  else if (msg.content.startsWith(prefix + "agendar")) {

    if (comp1 == "") {
      comp1 = msg.content.slice(10).split()
    }
    else if (comp2 == "") {
      comp2 = msg.content.slice(10).split()
    }
    else if (comp3 == "") {
      comp3 = msg.content.slice(10).split()
    }
    else {
      msg.channel.send("Agenda cheia!")
    }

  }
  else if (msg.content ===  prefix + "agenda") {

    if (comp1 == "" && comp2 == "" && comp3 == "") {
      msg.channel.send("Agenda vazia!")
    }
    else {
      var agenda = "AGENDA\n" + comp1 +"\n"+ comp2 +"\n"+ comp3
    
    msg.channel.send(agenda)
    }
  }
    else if (msg.content === prefix + "resetagenda") {
      comp1 = ""
      comp2 = ""
      comp3 = ""
    }
  else if (msg.content ===  prefix + "play") {
    msg.channel.send("play")
  }
  else if (msg.content ===  prefix + "stop") {
    msg.channel.send("stop")
  }
  else if (msg.content ===  prefix + "skip") {
    msg.channel.send("skip")
  }
})

          
/* Token */

client.login(process.env['TOKEN'])