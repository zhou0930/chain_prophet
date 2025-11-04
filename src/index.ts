import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
import { starterPlugin } from './plugin.ts';
import { evmBalancePlugin } from './evm-balance-plugin.ts';
import { evmTransferPlugin } from './evm-transfer-plugin.ts';
import { nftPlugin } from './nft-plugin.ts';
import { character } from './character.ts';

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info({ name: character.name }, 'Name:');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [nftPlugin, evmTransferPlugin, evmBalancePlugin, starterPlugin],
};

const project: Project = {
  agents: [projectAgent],
};

export { character } from './character.ts';

export default project;
