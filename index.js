
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

require('dotenv').config()
const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client({
  intents: [
    'GUILDS',            // Permite acessar informações de servidores
    'GUILD_MESSAGES'     // Permite acessar mensagens e eventos em servidores
  ]
});

const moment = require('moment-timezone')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

function sendMessage(message) {
  const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID)
  channel.send(message)
}


const commands = {
  add: addAppointment,
  help: showHelp,
  list: listAppointments,
  clear: clearAppointments
};

const help = {
  add: '!add [data no formato YYYY-MM-DD] [hora no formato HH:mm] [descrição do compromisso] - Adiciona um compromisso na agenda',
  help: '!help - Exibe esta mensagem de ajuda',
  list: '!list - Lista os compromissos agendados',
  clear: '!clear - Limpa todos os compromissos agendados'
}

function showHelp(message) {
  const commands = Object.keys(help).map((command) => help[command])
  message.reply(`Comandos disponíveis:\n${commands.join('\n')}`)
}

const agenda = {}

function listAppointments(message) {
  const appointmentList = getAppointments();
  if (appointmentList.length > 0) {
    const appointmentListFormatted = appointmentList.map((appointment) => {
      const date = moment.tz(appointment.date, 'x', 'America/Sao_Paulo');
      return `${date.format('DD/MM/YYYY HH:mm')} - ${appointment.description}`;
    });
    const reply = `Compromissos agendados:\n${appointmentListFormatted.join('\n')}`;
    message.reply(reply);
  } else {
    message.reply('Não há compromissos agendados.');
  }
}

client.on('message', (message) => {
  if (message.content.startsWith('!add')) {
    const args = message.content.split(' ')
    const date = moment.tz(`${args[1]} ${args[2]}`, 'YYYY-MM-DD HH:mm', 'America/Sao_Paulo')
    const description = args.slice(3).join(' ')
    const now = moment();
    if (date.isBefore(now)) {
      message.reply('A data e hora do compromisso devem estar no futuro.');
      return;
    }
    addAppointment(date, description);
    message.reply(`Compromisso agendado para ${date.format('DD/MM/YYYY HH:mm')} com a descrição "${description}".`)
  } else if (message.content.startsWith('!help')) {
    const commands = Object.keys(help).map((command) => help[command])
    message.reply(`Comandos disponíveis:\n${commands.join('\n')}`)
  } else if (message.content.startsWith('!list')) {
    commands.list(message);
  } else if (message.content.startsWith('!clear')) {
    clearAppointments(message);
  }
})


function checkAgenda() {
  const now = moment.tz('America/Sao_Paulo');
  const oneDayFromNow = moment.tz('America/Sao_Paulo').add(1, 'day');
  let appointmentList = getAppointments();
  const notifiedAppointments = [];

  appointmentList = appointmentList.filter((appointment) => {
    const date = moment.tz(appointment.date, 'x', 'America/Sao_Paulo');
    if (date.isBefore(now)) {
      // O compromisso já passou, então é removido da lista
      return false;
    }
    return true;
  });

  appointmentList.forEach((appointment) => {
    const date = moment.tz(appointment.date, 'x', 'America/Sao_Paulo');
    if (date.isBetween(now, oneDayFromNow)) {
      const description = appointment.description;
      if (!appointment.notified) {
        sendMessage(`Lembrete: Amanhã (${date.format('DD/MM/YYYY HH:mm')}) você tem o seguinte compromisso: ${description}`);
        notifiedAppointments.push({ ...appointment, notified: true });
      } else {
        notifiedAppointments.push(appointment);
      }
    } else {
      notifiedAppointments.push(appointment);
    }
  });

  saveAppointments(notifiedAppointments);
}


function getAppointments() {
  let appointments = [];
  if (fs.existsSync('appointments.json') && fs.statSync('appointments.json').size > 0) { // verifica se o arquivo existe e não está vazio
    appointments = JSON.parse(fs.readFileSync('appointments.json')); // lê o arquivo JSON
  }
  return appointments;
}

function addAppointment(date, description) {
  let appointments = getAppointments();
  appointments.push({ date: date.valueOf(), description, notified: false });
  saveAppointments(appointments);
  agenda[date.valueOf()] = description;
}

function saveAppointments(appointments) {
  fs.writeFileSync('appointments.json', JSON.stringify(appointments));
}

function clearAppointments(message) {
  saveAppointments([]);
  Object.keys(agenda).forEach((key) => delete agenda[key]);
  message.reply('Todos os compromissos agendados foram apagados.');
}


const now = moment();
if (now.isBefore(now)) {
  message.reply('A data e hora do compromisso devem estar no futuro.');
  return;
}


setInterval(checkAgenda, 60 * 1000) // Verificar a agenda a cada hora



/* Token */

client.login(process.env['TOKEN'])