import { Client, WSEventType } from 'discord.js';
import { GatewayServer, SlashCreator } from 'slash-create';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { MessageHandlerManager } from './handlers/MessageHandlerManager';
import { SuggestionsBox } from './handlers/SuggestionsBox';

class Main {
  private creator: SlashCreator;
  private client: Client;
  private messageHandlerManager:MessageHandlerManager

  constructor() {
    dotenv.config();
    this.initializeBot();
    this.initializeListeners();

  }

  initializeListeners() {
    this.client.on('ready', () => console.log('Bot started successfully.'));
    this.creator.on('debug', (message) => console.log(message));
    this.client.on("message", (msg) => {this.messageHandlerManager.handle(msg)})
  }

  initializeBot() {
    console.log('Starting...');
    this.client = new Client();
    this.creator = new SlashCreator({
      applicationID: process.env.APPLICATION_ID,
      publicKey: process.env.PUBLIC_KEY,
      token: process.env.TOKEN,
    });
    console.log(path.join(__dirname, 'commands'));
    this.creator
      .withServer(
        new GatewayServer(
          (handler) => {
            this.client.ws.on(<WSEventType>'INTERACTION_CREATE', handler);
          },
        ),
      )
      .registerCommandsIn(path.join(__dirname, 'commands'))
      .syncCommands();

      this.messageHandlerManager = new MessageHandlerManager() 
      .add(new SuggestionsBox())

    this.client.login(process.env.TOKEN);
  }
}

new Main();
