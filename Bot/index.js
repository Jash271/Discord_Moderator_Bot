require('dotenv').config();
const fetch = require('node-fetch');
const axios = require('axios');
console.log(process.env.DISCORD_BOT_TOKEN);

const { Client } = require('discord.js');

const client = new Client({
  partials: ['MESSAGE', 'REACTION'],
});
const PREFIX = '$';
let Violations = {};
client.on('ready', async () => {
  console.log(`${client.user.tag} has logged in`);
});

client.on('message', async (message) => {
  console.log(`${message.author.username} has posted ${message.content}`);

  const invite = await message.channel.createInvite({
    unique: true,
    maxAge: 86400,
  });

  if (message.author.bot) {
    console.log(message.author.bot);
    return;
  }
  const data = {
    query: `${message.content}`,
  };
  console.log(data);
  const headers = {
    'Content-Type': 'application/json',
  };

  const CheckedData = await axios.post('http://localhost:8000/classify', data, {
    headers: headers,
  });
  console.log(CheckedData.data.dict);
  const size = Object.keys(CheckedData.data.dict).length;
  if (size >= 3) {
    await message.author.send(
      `The message you recently posted violates our community rules and is hence deleted`
    );
    const ch_id = message.channel.id
    await message.delete();
    
    const id = message.author.id;
    const person = message.guild.members.cache.get(id);
    console.log(Violations[id]);
    if (!(id in Violations)) {
      console.log('First Time');
      Violations[id] = 1;
      return;
    }
    if (Violations[id] > 3) {
      await message.author.send(
        `You are being Kicked out of the server for not following our community guidelines despite repeated Warnings`
      );
      delete Violations[id]
      await person.kick();
      
    } else {
      Violations[id] = Violations[id] + 1;
    }

    console.log(Violations);
    return;
  }
  if (message.content === 'hello') {
    await message.reply(`Hey There ${message.author.username}`);
    return;
  }
  if (message.content === 'delete') {
    await message.channel.send('deleted message');
    await message.author.send('Deleted Mesaage');
    await message.delete();
    return;
  }

  if (message.content.startsWith(PREFIX)) {
    const [cmd_name, ...args] = message.content
      .trim()
      .substring(1)
      .split(/\s+/);
    console.log(cmd_name);
    console.log(args);

    switch (cmd_name) {
      case 'invite':
        await message.reply(
          `Hey Here's the server joining Code ${invite.code}`
        );
        return;
      case 'kick':
        if (!message.member.hasPermission('KICK_MEMBERS')) {
          return message.reply('You do not have Permissions');
        }
        if (args.length === 0 && cmd_name === 'kick')
          return message.reply('Please Provide an ID');
        const member = message.guild.members.cache.get(args[0]);
        if (member) {
          try {
            await member.kick();
          } catch (error) {
            await message.channel.send('I do not have permission  ¯\\_(ツ)_/¯');
          }
        } else {
          const shrug = '¯\\_(ツ)_/¯';
          message.channel.send(`member not found ${shrug}`);
        }

      case 'Joke':
        const joke = await axios.get(
          'https://official-joke-api.appspot.com/jokes/programming/random'
        );
        console.log(joke);
        const Joke = `${joke.data[0].setup} \n ${joke.data[0].punchline}`;
        console.log(Joke);
        await message.channel.send(Joke);
        return;

      case 'Ban':
        if (!message.member.hasPermission('BAN_MEMBERS')) {
          return message.reply('You do not have Permissions ¯\\_(ツ)_/¯');
        }
        if (args.length === 0) return message.reply('Please Provide an ID');

        await message.guild.members.ban(args[0]);
        await message.channel.send('Banned User');
        return;

      case 'Imp':
        if (args.length === 0) return message.reply('Please Provide a Message');
        const Message = args.join(' ');
        const message_1 = await message.channel.send(`${Message} @everyone`);
        await message_1.pin();
        return;
    }
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  console.log('Hello');
  const { name } = reaction.emoji;
  const member = reaction.message.guild.members.cache.get(user.id);
  if (reaction.message.id === '763808565575548948') {
    switch (name) {
      case '🍎':
        member.roles.add('763807734130016287');
        break;
      case '🐍':
        member.roles.add('763807705453297697');
        break;
      case '🍑':
        member.roles.add('763807760415457320');
        break;
    }
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  console.log('Hello');
  const { name } = reaction.emoji;
  const member = reaction.message.guild.members.cache.get(user.id);
  if (reaction.message.id === '763808565575548948') {
    switch (name) {
      case '🍎':
        member.roles.remove('763807734130016287');
        break;
      case '🐍':
        member.roles.remove('763807705453297697');
        break;
      case '🍑':
        member.roles.remove('763807760415457320');
        break;
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
