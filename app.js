const Discord = require("discord.js");
const Commando = require('discord.js-commando');
const ytdl = require('ytdl-core');

const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});

const fs = require('fs');
const mongoose = require("mongoose")
const schemas = require("./schemas");
const students = require("./schemas");
const weather = require('openweather-apis');

const db = mongoose.connect('mongodb://127.0.0.1/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).catch(err => {
    console.log("failure");
}).then(doc => {
    console.log("success");
});

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    console.log(command.name)
    client.commands.set(command.name, command);
}

let board = new Array(3);
let fixMessage;
let isRed = false;

let click = 0;

let user = undefined,
    user1 = undefined;

client.on('interactionCreate', async (button) => {
    
    if(button.customId === 'click') {
        const Button = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
               .setCustomId("click")
               .setLabel("Do not click me")
               .setStyle("PRIMARY"),
        );
        
        button.deferUpdate();

        fixMessage.edit({content: "clicks:" + (++click), components: [Button]});
        return;
    }

    if ((!isRed && button.member.id != user1) || (isRed && button.member.id != user)) {
        fixMessage.channel.send(`${button.member.user.username}, you are not the one playing`);
        button.deferUpdate();

        return;
    }

    if (!fixMessage)
        return;
    if (button.customId >= '0' && button.customId <= '8') {
        let row = Math.floor(button.customId / 3),
            col = Math.ceil(button.customId % 3);
        console.log("ASDASDASD:" + row + ' ' + col);
        if (board[row][col].style !== "SECONDARY") {
            button.deferUpdate();
            return;
        }
        if (isRed) {
            board[row][col].setStyle("DANGER");
        } else {
            board[row][col].setStyle("PRIMARY");
        }
        isRed = !isRed;
    }

    for (let i = 0; i < 3; i++) {
        let win = true,
            win1 = true;
        let color = board[i][0].style,
            color1 = board[0][i].style;
        for (let j = 1; j < 3; j++) {
            if (color != board[i][j].style || color === "SECONDARY")
                win = false;
            if (color1 != board[j][i].style || color1 === "SECONDARY")
                win1 = false;
        }
        if (win || win1) {
            button.channel.send(`${button.member.user.username} won !`);
            fixMessage.delete();

            return;
        }
    }
    console.log((board[0][0].style === board[1][1].style && board[0][0].style === board[2][2].style && board[2][2].style != "SECONDARY"));

    if ((board[0][0].style === board[1][1].style && board[0][0].style === board[2][2].stlye && board[2][2].style != "SECONDARY") ||

        (board[0][2].style === board[1][1].style && board[0][2].style === board[2][0].style && board[2][0].style != "SECONDARY")) {
        button.channel.send(`${button.member.user.username} won !`);
        fixMessage.delete();

        return;
    }

    let i = 9;

    let result = [];
    for (let i = 0; i < board.length; i++) {
        let currRow = [];
        for (let j = 0; j < board[i].length; j++) {
            currRow.push(board[i][j]);
        }
        result.push(new Discord.MessageActionRow().addComponents(currRow));
    }

    fixMessage.edit({
        content: (isRed === true) ? "red" : "blue",
        components: result
    });
    button.deferUpdate();
})

async function start(message) {
    let w = 0;
    for (let row = 0; row < 3; row++)
        board[row] = new Array(3);
    await console.log(board);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let button = new Discord.MessageButton()
                .setCustomId(String(w))
                .setStyle("SECONDARY")
                .setLabel('x');

            board[i][j] = button;
            w++;
        }
    }
    let i = 9;
    let result = [];
    for (let i = 0; i < board.length; i++) {
        let currRow = [];
        for (let j = 0; j < board[i].length; j++) {
            currRow.push(board[i][j]);
        }
        result.push(new Discord.MessageActionRow().addComponents(currRow));
    }
    fixMessage = await message.channel.send({
        content: (isRed === true) ? "red" : "blue",
        components: result
    });
}

let Start = false;

client.on('message', async message => {
    if (message.content[0] === '!' && !message.member.roles.cache.some(r => r.name === "Principal") && message.author.id != 415057593170657293) {
        message.channel.send("Какво си позволяваш ?");

        return;
    }
    let args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (command === "game") {
        user = message.author;
        user1 = message.mentions.users.first();
        if (!Start)
            start(message);
    }

    console.log(args);

    if (command == "amogus!p") {
        if(!message.member.voice.channel)
            message.channel.send(`${message.author.name} sussy bot`);
        
            const connection = await message.member.voice.channel.join();
            
            let url = "";
            for(let i = 0; i < args.length; i++)
                url += args[i];
            connection.play(ytdl(url));
    } else if(command == "amogus!leave") {
        message.guild.me.voice.channel.leave();
    }

    if (command === '!addstudent')
        client.commands.get(command).execute(message, args);
    else if (command === '!delgrade')
        client.commands.get(command).execute(message, args);
    else if (command === '!addgrade')
        client.commands.get(command).execute(message, args);
    else if (command === 'infograde')
        client.commands.get(command).execute(message, args);
    else if (command === 'leaderboard')
        client.commands.get(command).execute(message, args);
    else if (command === 'cls')
        client.commands.get(command).execute(message, args);
    else if (command === 'notify') {
        console.log("!!!" + args[0]);
        client.commands.get(command).execute(message, args);
    } else if (command === 'challange')
        client.commands.get(command).execute(message, args);
    else if (command === "birthday") {
        let birthdayEmbed = new Discord.MessageEmbed();
        let q = client.users.fetch("862313343649054740");
        birthdayEmbed.setTitle(`Честит рожден ден !`)

            .addField("Пожелавам ти много успехи за напред !", "В момента включваме изпита ти накрая на годината.", true)
            .addField("Съветвам те да си подбираш приятелите.", "както видя може да очакваш неочакваното", true)

            .addField("Също може да си злобна, ама си част от хората, които са злобно яки", "Вярвам, че няма да станеш сериен убиец!", true)
            .setColor("#ffffff")
            .setFooter("Честит 13-ти рожден ден !", (await q).avatarURL())
            .setThumbnail("https://images.squarespace-cdn.com/content/v1/5b599167cef372c8f893096d/1586084440575-A1BWT2HMHCD3YCB9I6G5/Cute+Panda+Printable+Birthday+Card.jpg?format=500w");
        message.channel.send({
            embeds: [birthdayEmbed]
        });
    }

});


schemas.getUsers = function () {
    return new Promise((resolve, reject) => {
        this.find((err, docs) => {
            if (err) {
                console.error(err)
                return reject(err)
            }

            resolve(docs)
        })
    })
}

client.on('ready', q => {
    const channel = client.channels.cache.get("785831791151546378");

    const user = client.users.cache.find(user => user.username === "Ivelin");

    const embed = new Discord.MessageEmbed()
        .setTitle("BACK AND ONLINE")
        .setImage("https://64.media.tumblr.com/84dcd20d75c69cf7912e97ee13e5aeeb/0f0a1cae2c03b711-e7/s1280x1920/528983d792a01bed93bc4718763b7ca71967e09f.gifv")
        .setColor("#ff5e00");

    channel.send(embed);

    client.user.setActivity(`Аз съм в ${client.guilds.cache.size} сървъра !`, {
        type: 'WATCHING'
    });
});

flag = undefined;

setInterval(() => {
    let dt = new Date();

    if (dt.getHours() == 24) {
        flag = true;
    }
}, 60 * 1000);

setInterval(async () => {
    if (flag != true)
        return;

    let dt = new Date();
    

    let month = dt.getMonth(), day = dt.getDate(), year = 2021;
    let tillMonth = 0, tillDay = 5, tillHour = 0, tillYear = 2022;

    tillMonth -= month;
    if (tillMonth < 0 && year < tillYear) {
        year--;
        tillMonth += 12;
    }
    tillDay -= day;

    if (tillDay < 0 && tillMonth > 0) {
        tillMonth--;
        tillDay += 31;
    }
    const channel = client.channels.cache.get("909767992991170580");

    let time = "";
    if (tillMonth == 0)
        time = tillDay + " дни";
    else
        time = tillMonth.toString() + " месец " + "и " + tillDay + " дни";
    channel.setName("НОИ - " + time)
    flag = false;
}, 50000);

let subjectStart = [
    { 
        startAtHours: 13,
        startAtMinutes: 30,

        endAtHours: 14,
        endAtMinutes: 10
    }, 
    {
        startAtHours: 14,
        startAtMinutes: 20,

        endAtHours: 15,
        endAtMinutes: 0
    },
    {
        startAtHours: 15,
        startAtMinutes: 10,

        endAtHours: 15,
        endAtMinutes: 50
    }, 
    {
        startAtHours: 16,
        startAtMinutes: 10,

        endAtHours: 16,
        endAtMinutes: 50
    }, 
    {
        startAtHours: 17,
        startAtMinutes: 0,

        endAtHours: 17,
        endAtMinutes: 40
    },
    {
        startAtHours: 17,
        startAtMinutes: 45,

        endAtHours: 18,
        endAtMinutes: 25
    }, 
    {
        startAtHours: 18,
        startAtMinutes: 30,

        endAtHours: 19,
        endAtMinutes: 10
    }
];

let subjects =
[
    
    [
       "Философия", "Немски", "Немски", "Химия", "Физическо", "Математика", "Математика"
    ], 
    [
        "БЕЛ", "БЕЛ", "Философия", "История", "Химия", "Физика", "География"
    ], 
    [
        "Физическо", "АНГ", "АНГ", "География", "Физика", "История"
    ], 
    [
        "БЕЛ", "БЕЛ", "Икономика", "Биология", "История", "География", "Изобразително"
    ],
    [
        "Математика", "Биология", "Програмиране", "Програмиране", "Програмиране", "Програмиране", "Програмиране"
    ]  
];

setInterval(async () => {
    let dt = new Date();

    const nextSubject = await client.channels.cache.get("909816114719100929"); // #програма
    const timeLeft = client.channels.cache.get("909816452570316880");

    let success = false, subject = nextSubject.name;
    console.log("ASD");
    let currIndex = 0
    for(let i = 0; i < 7; i++) {

        if(dt.getHours() == subjectStart[i].startAtHours &&
            dt.getMinutes() >= subjectStart[i].startAtMinutes-4 && 
        ((dt.getHours() < subjectStart[i].endAtHours) ? true : dt.getMinutes() <= subjectStart[i].endAtMinutes)) {            
            success = true;
            subject = subjects[dt.getDay()-1][i+1];

            currIndex = i;
            break;
        }
    }
    if(!success || nextSubject.name == "Следващ: " + subject)
        return;
    
    console.log("changed");

    nextSubject.setName("Следващ: " + subject);
    timeLeft.setName("Край: " + subjectStart[currIndex].endAtHours + ":" + subjectStart[currIndex].endAtMinutes);
    
}, 2500);


client.on('message', async (msg) => {
    if (msg.content === "rnd") {
        let arr = ['A', 'B', 'C', 'D'];
        let idx = Math.floor(Math.random() * arr.length);

        msg.channel.send(arr[idx]);
    }

    if(msg.content === "amogus") {
        let voice = msg.member.voice.channel;


        voice.join().then(connection => {
            const dispatcher = connection.play("amogus.mp3");
            dispatcher.on("end", end => {voice.leave()});
        }).catch(err => {
            console.log(err);
        })
    }
    if (msg.content === "say less") {
        msg.guild.members.get(862313343649054740).setNickname("mrunkalo");

    }
    if (msg.content === "rainbow me") {

        msg.channel.send("starting now");

        let role = msg.guild.roles.cache.find(role => role.name === "rainbow");
        var colors = ['#eb3434', '#00ffae', '#00e5ff', '#ff00bb'];

        var lastColor = -1;

        var rnd = Math.floor(Math.random() * colors.length);
        setInterval(function () {
            rnd = Math.floor(Math.random() * colors.length);

            while (rnd == lastColor) {
                rnd = Math.floor(Math.random() * colors.length);
            }
            role.edit({
                color: colors[rnd]
            })

            lastColor = rnd;
            console.log(rnd);
        }, 2500);
    }
});

client.on('message', async (msg) => {
    if (msg.guild === 'dm') {
        console.log(msg);
    }

    if(msg.content === "button") {
        const button = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
               .setCustomId("click")
               .setLabel("Do not click me")
               .setStyle("PRIMARY"),
        );

        fixMessage = await msg.channel.send(button);
    }

    if (msg.content === "w") {
        client.users.cache.get("415057593170657293").send("СТРАНДАЖНКА");
    }
    if (msg.content === "q") {
        let dt = new Date();
        let day = dt.getDate();
        let hour = dt.getHours();

        let tillDay = 16,
            tillHour = 24,
            tillMonth = 0;

        let month = dt.getMonth() + 1;
        let year = dt.getFullYear();

        let daysInMonth = new Date(year, month, 0).getDate();

        let dayLeft = daysInMonth - day;
        console.log("day left" + dayLeft);

        tillDay += dayLeft;
        let index = month;

        while (tillDay >= daysInMonth) {
            tillDay -= daysInMonth;
            tillMonth++;
        }
        const channel = client.channels.cache.get("867350856931344394");

        const embedMessage = new Discord.MessageEmbed()
            .setTitle("Първи учебен ден след:")
            .addField(tillMonth.toString() + " месеца " + tillDay + " дни", "и " + (tillHour - hour) + " часа")
            .setColor("#ffffff")
            .setThumbnail("https://media.giphy.com/media/eljCVpMrhepUSgZaVP/giphy.gif");

        msg.channel.send(embedMessage);
    }

    if (msg.content == "reload") {
        const list = client.guilds.cache.get("847753025468891166");

        list.members.fetch().then(members => {
            members.forEach(member => {
                if (member.roles.cache.some(role => role.name === "Student")) {
                    let student = new schemas({
                        _id: member.user.id,
                        grades: [],
                        totalGrade: 0
                    });

                    student.save().then(doc => {
                        console.log(doc);
                    }).catch(err => {
                        msg.channel.send(err);
                    });
                }
            })
        });
    } else if (msg.content == "help") {
        const embed = Discord.MessageEmbed()
            .setTitle("COMMANDS")
            .addField("!addStudent <name>")
            .addField("!addGrade <name>")
            .addField("!del <name>", "remove a student");
    } else if (msg.content.includes("say")) {
        if (msg.author.id != 415057593170657293 && msg.author.id != 688992954416758814) {
            msg.channel.send("Fuck you");
            return;
        }

        let respond = "";
        for (let i = 4; i < msg.content.length; ++i)
            respond += msg.content[i];

        msg.delete();
        msg.channel.send(respond);

    } else if (msg.content === "weather") {
        weather.setLang('bg');
        weather.setAPPID('1d243d7ebdb4b211d19c78df3623e8bb');

        weather.setCity('Varna');

        await weather.getAllWeather(function (err, obj) {
            const embed = new Discord.MessageEmbed()
                .setTitle("Програма за времето")
                .addField(obj.weather[0].description.toUpperCase(), `Макс: ${obj.main.temp_max} Мин: ${obj.main.temp_min} градуса`)
                .addField(`Вятър`, `${obj.wind.speed} км/ч`)
                .setColor("#ffffff");

            msg.channel.send(embed);
        });

    }

});

client.login("ODQ3NzUyNTk5OTMxNTg0NTMy.YLCpIg.rSPfz4TVIVb2NxPRB3N3T0mQZ6Y");