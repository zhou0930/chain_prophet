import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
import starterPlugin from './plugin.ts';
import { evmBalancePlugin } from './evm-balance-plugin.ts';
import { nftPlugin } from './nft-plugin.ts';
import { character } from './character.ts';

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info({ name: character.name }, 'Name:');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  // NFT 插件放在最前面以确保最高优先级
  plugins: [nftPlugin, starterPlugin, evmBalancePlugin], // NFT 插件优先，避免与 EVM 插件冲突
};

const project: Project = {
  agents: [projectAgent],
};

export { character } from './character.ts';

export default project;
