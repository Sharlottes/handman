import { ClassMethodDecorator, GuardFunction } from "discordx";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      TEST_CHANNEL_ID: string;
      TEST_GUILD_ID: string;
    }
  }
}

declare module "discordx" {
  export function Guard(...fns: GuardFunction[]): ClassMethodDecorator;
}

export {};
