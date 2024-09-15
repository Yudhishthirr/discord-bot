import dotenv from 'dotenv';
dotenv.config();
import { REST, Routes,ApplicationCommandOptionType,  } from 'discord.js';

const commands = [
  {
      name: 'ask',
      description: 'Ask your questions to ai',
      options: [
          {
              name: 'message',
              description: 'Message to include with pong',
              type: ApplicationCommandOptionType.String,
              required: true,
          },
      ],
  },
  {
    name: 'imgask',
    description: 'Ask your questions to AI with an image attachment',
    options: [
      {
        name: 'image',
        description: 'Message to include with the image',
        type: ApplicationCommandOptionType.Attachment,
        required: true,
      },
      {
        name: 'question',
        description: 'Your question to the AI',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: 'video',
    description: 'Ask your questions to AI with an Video attachment',
    options: [
      {
        name: 'video',
        description: 'Message to include with the video',
        type: ApplicationCommandOptionType.Attachment,
        required: true,
      },
      {
        name: 'question',
        description: 'Your question to the AI',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.MY_TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}