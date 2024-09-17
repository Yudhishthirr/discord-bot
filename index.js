import dotenv from 'dotenv';
dotenv.config();
import {genrative_chat,textGenMultimodalOneImagePrompt,textGenMultimodalVideoPrompt} from './gemini_response.js';
import { Client, GatewayIntentBits } from 'discord.js';


const client = new Client(
    { 
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ] 
    }
);

client.on("messageCreate",async(message)=>{
    if(message.author.bot) return;
    try {
        await message.channel.sendTyping();
        const userMessage =message.content;
        const response  = await genrative_chat(userMessage)
        message.reply({
            content:`${response}`,
        })
    } catch (error) {
        message.reply({
            content:`Failed to message: ${error}`,
        })
    }

client.on("interactionCreate",async (interaction)=>{
    // console.log(interaction);
    if (!interaction.isCommand()) return;
    if(interaction.commandName === 'ask'){  
        try {
            const userMessage = await interaction.options.getString('message');
            // console.log(userMessage)
             if(userMessage){
                await interaction.deferReply(); 
                const response  = await genrative_chat(userMessage)
                await interaction.editReply(`Result: ${response}`);
            }else{
                await interaction.editReply('An error occurred.');
            }
           

        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred.');
        } 
    }
    if(interaction.commandName === 'imgask'){
        try {
            const image =await interaction.options.getAttachment('image');
            const question =await interaction.options.getString('question');
            // console.log("my image :",image.attachment)
            // console.log("question :",question)
            if(question && image.attachment){

                await interaction.deferReply(); 
                const response  = await textGenMultimodalOneImagePrompt(image.attachment,question)
                await interaction.editReply(`Result: ${response}`);
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred.');
        }
    }
    if(interaction.commandName === 'video'){
        try {
            const image =await interaction.options.getAttachment('video');
            const question =await interaction.options.getString('question');
            // console.log("my image :",image.attachment)
            // console.log("question :",question)
            if(question && image.attachment){

                await interaction.deferReply(); 
                const response  = await textGenMultimodalVideoPrompt(image.attachment,question)
                await interaction.editReply(`Result: ${response}`);
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred.');
        }
    }
})

})
client.login(process.env.MY_TOKEN)
