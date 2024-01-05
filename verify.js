const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

// Configuration
const BOT_TOKEN = "MTE5MDEwNjc3MzI0MDE2MDM4Ng.GkVExA.JpJWn-QO_m1aLAc3BZmtIY9NE4LTaex_BtSpRg";
const GUILD_ID = "1188145635879301130";
const VERIFY_CHANNEL_ID = "1190109823694553188";
const VERIFIED_ROLE_ID = "1188219435513823342";
const NEXT_STEPS_CHANNEL_ID = "1188218715603480636";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.userAnswers = new Map();
client.userInteractions = new Map(); // Store interactions for each user

function generateMathProblem() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    const answer = operation === '+' ? num1 + num2 : num1 - num2;
    return { problem: `${num1} ${operation} ${num2}`, answer: answer.toString() };
}

client.once('ready', async () => {
    console.log('Ready!');
    const channel = await client.channels.fetch(VERIFY_CHANNEL_ID);
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('verify_button')
                .setLabel('Verify')
                .setStyle(ButtonStyle.Primary),
        );

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Lets Make Sure You Are Human')
        .setDescription('** Hello, I am Story Bot Verify!** \n ** Welcome to Story Bot**\n\n *Please complete our easy verification and follow its instructions.');

    await channel.send({ embeds: [embed], components: [row] });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'verify_button') {
        const { problem, answer } = generateMathProblem();
        client.userAnswers.set(interaction.user.id, { problem, answer });
        client.userInteractions.set(interaction.user.id, interaction); // Store the interaction

        await interaction.reply({ content: `**Solve this math problem for verification:** ${problem}`, ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content || message.channel.id !== VERIFY_CHANNEL_ID || !client.userAnswers.has(message.author.id)) return;

    const userData = client.userAnswers.get(message.author.id);
    const userInteraction = client.userInteractions.get(message.author.id); // Retrieve the interaction

    if (message.content.trim() === userData.answer) {
        const guild = await client.guilds.fetch(GUILD_ID);
        const role = guild.roles.cache.get(VERIFIED_ROLE_ID);
        const member = await guild.members.fetch(message.author.id);
        await member.roles.add(role);

        userInteraction.followUp({ 
            content: `Congratulations, <@${message.author.id}>! You are now verified. Please proceed to <#${NEXT_STEPS_CHANNEL_ID}> for the next steps to gain full server access.`,
            ephemeral: true 
        });

        await message.delete();
        client.userAnswers.delete(message.author.id);
        client.userInteractions.delete(message.author.id);
    } else {
        await message.reply({ content: `Incorrect answer. Please try again.`, ephemeral: true });
        await message.delete();
    }
});

client.login(BOT_TOKEN);


















