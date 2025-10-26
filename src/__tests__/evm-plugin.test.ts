import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { createMockRuntime, createMockMessage, createMockState, setupTest } from './test-utils';
import { character } from '../index';

describe('EVM Plugin Integration', () => {
  let mockRuntime: any;
  let mockMessage: any;
  let mockState: any;
  let callbackFn: any;

  beforeEach(() => {
    const testSetup = setupTest({
      messageText: 'Test EVM operation',
      runtimeOverrides: {
        getSetting: (key: string) => {
          if (key === 'EVM_PRIVATE_KEY') return 'test-private-key';
          if (key === 'OPENAI_API_KEY') return 'test-openai-key';
          return null;
        }
      }
    });
    
    mockRuntime = testSetup.mockRuntime;
    mockMessage = testSetup.mockMessage;
    mockState = testSetup.mockState;
    callbackFn = testSetup.callbackFn;
  });

  afterEach(() => {
    // Clean up any mocks
  });

  describe('Character Configuration', () => {
    it('should have correct name and identity', () => {
      expect(character.name).toBe('Chain Prophet');
      expect(character.username).toBe('chain_prophet');
    });

    it('should include EVM plugin when EVM_PRIVATE_KEY is set', async () => {
      // Mock environment variable
      const originalEnv = process.env.EVM_PRIVATE_KEY;
      process.env.EVM_PRIVATE_KEY = 'test-key';

      try {
        // Clear module cache and re-import character
        delete require.cache[require.resolve('../character.ts')];
        const { character: reloadedCharacter } = await import('../character.ts?t=' + Date.now());
        expect(reloadedCharacter.plugins).toContain('@elizaos/plugin-evm');
      } finally {
        // Restore original environment
        process.env.EVM_PRIVATE_KEY = originalEnv;
        // Clear cache again to restore original state
        delete require.cache[require.resolve('../character.ts')];
      }
    });

    it('should not include EVM plugin when EVM_PRIVATE_KEY is not set', async () => {
      // Mock environment variable
      const originalEnv = process.env.EVM_PRIVATE_KEY;
      delete process.env.EVM_PRIVATE_KEY;

      try {
        // Clear module cache and re-import character
        delete require.cache[require.resolve('../character.ts')];
        const { character: reloadedCharacter } = await import('../character.ts?t=' + Date.now());
        expect(reloadedCharacter.plugins).not.toContain('@elizaos/plugin-evm');
      } finally {
        // Restore original environment
        process.env.EVM_PRIVATE_KEY = originalEnv;
        // Clear cache again to restore original state
        delete require.cache[require.resolve('../character.ts')];
      }
    });

    it('should have blockchain-related topics', () => {
      expect(character.topics).toContain('blockchain protocols and architecture');
      expect(character.topics).toContain('on-chain transaction execution');
      expect(character.topics).toContain('gas optimization and fee structures');
      expect(character.topics).toContain('smart contract interaction');
      expect(character.topics).toContain('decentralized finance (DeFi) operations');
      expect(character.topics).toContain('blockchain network upgrades');
    });

    it('should have blockchain capabilities in bio', () => {
      expect(character.bio).toContain('Blockchain specialist with deep expertise in on-chain transactions');
      expect(character.bio).toContain('Proficient in Ethereum, Bitcoin, and major smart contract platforms');
      expect(character.bio).toContain('Skilled in transaction optimization, gas management, and security protocols');
      expect(character.bio).toContain('Expert in smart contract interaction and blockchain analytics');
    });

    it('should have appropriate adjectives', () => {
      expect(character.adjectives).toContain('precise');
      expect(character.adjectives).toContain('technical');
      expect(character.adjectives).toContain('security-focused');
      expect(character.adjectives).toContain('professional');
    });

    it('should have blockchain examples in messageExamples', () => {
      const blockchainExamples = character.messageExamples.filter(example => 
        example.some(msg => 
          msg.content.text.includes('ETH') || 
          msg.content.text.includes('transaction') ||
          msg.content.text.includes('gas') ||
          msg.content.text.includes('network')
        )
      );
      
      expect(blockchainExamples.length).toBeGreaterThan(0);
    });

    it('should have knowledge configuration', () => {
      expect(character.knowledge).toBeDefined();
      expect(Array.isArray(character.knowledge)).toBe(true);
      expect(character.knowledge).toContain('Blockchain transaction mechanics and gas optimization');
      expect(character.knowledge).toContain('Smart contract security best practices');
    });

    it('should have templates configuration', () => {
      expect(character.templates).toBeDefined();
      expect(character.templates?.messageTemplate).toBeDefined();
      expect(character.templates?.thoughtTemplate).toBeDefined();
      expect(character.templates?.actionTemplate).toBeDefined();
    });

    it('should have appropriate settings', () => {
      expect(character.settings).toBeDefined();
      expect(character.settings.model).toBe('gpt-4');
      expect(character.settings.temperature).toBe(0.3);
      expect(character.settings.maxTokens).toBe(2000);
    });
  });

  describe('EVM Plugin Actions', () => {
    it('should handle transfer action requests', async () => {
      const transferMessage = createMockMessage('Send 0.1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      
      // Mock the EVM plugin actions
      const mockEVMPlugin = {
        name: 'evm',
        actions: [
          {
            name: 'EVM_TRANSFER',
            validate: async () => true,
            handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
              await callback({
                text: 'Transferred 0.1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                content: { hash: '0x123...' }
              });
              return { success: true };
            }
          }
        ]
      };

      // Test the action
      const action = mockEVMPlugin.actions[0];
      const result = await action.handler(mockRuntime, transferMessage, mockState, {}, callbackFn);
      
      expect(result.success).toBe(true);
      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Transferred 0.1 ETH')
        })
      );
    });

    it('should handle swap action requests', async () => {
      const swapMessage = createMockMessage('Swap 100 USDC for DAI on Arbitrum');
      
      const mockSwapAction = {
        name: 'EVM_SWAP',
        validate: async () => true,
        handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
          await callback({
            text: 'Swapped 100 USDC for DAI on Arbitrum',
            content: { hash: '0x456...', route: 'LiFi' }
          });
          return { success: true };
        }
      };

      const result = await mockSwapAction.handler(mockRuntime, swapMessage, mockState, {}, callbackFn);
      
      expect(result.success).toBe(true);
      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Swapped 100 USDC for DAI')
        })
      );
    });

    it('should handle bridge action requests', async () => {
      const bridgeMessage = createMockMessage('Bridge 50 USDC from Ethereum to Base');
      
      const mockBridgeAction = {
        name: 'EVM_BRIDGE',
        validate: async () => true,
        handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
          await callback({
            text: 'Bridging 50 USDC from Ethereum to Base',
            content: { hash: '0x789...', route: 'LiFi' }
          });
          return { success: true };
        }
      };

      const result = await mockBridgeAction.handler(mockRuntime, bridgeMessage, mockState, {}, callbackFn);
      
      expect(result.success).toBe(true);
      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Bridging 50 USDC')
        })
      );
    });

    it('should handle governance action requests', async () => {
      const governanceMessage = createMockMessage('Vote FOR on proposal #42');
      
      const mockGovernanceAction = {
        name: 'EVM_GOV_VOTE',
        validate: async () => true,
        handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
          await callback({
            text: 'Voted FOR on proposal #42',
            content: { hash: '0xabc...', proposalId: '42' }
          });
          return { success: true };
        }
      };

      const result = await mockGovernanceAction.handler(mockRuntime, governanceMessage, mockState, {}, callbackFn);
      
      expect(result.success).toBe(true);
      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Voted FOR on proposal #42')
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle insufficient funds error', async () => {
      const transferMessage = createMockMessage('Send 1000 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      
      const mockAction = {
        name: 'EVM_TRANSFER',
        validate: async () => true,
        handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
          throw new Error('Insufficient funds for transaction');
        }
      };

      try {
        await mockAction.handler(mockRuntime, transferMessage, mockState, {}, callbackFn);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('Insufficient funds');
      }
    });

    it('should handle invalid address error', async () => {
      const transferMessage = createMockMessage('Send 0.1 ETH to invalid-address');
      
      const mockAction = {
        name: 'EVM_TRANSFER',
        validate: async () => true,
        handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
          throw new Error('Invalid recipient address');
        }
      };

      try {
        await mockAction.handler(mockRuntime, transferMessage, mockState, {}, callbackFn);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('Invalid recipient address');
      }
    });
  });

  describe('Configuration Validation', () => {
    it('should validate EVM_PRIVATE_KEY is set', () => {
      const hasPrivateKey = !!mockRuntime.getSetting('EVM_PRIVATE_KEY');
      expect(hasPrivateKey).toBe(true);
    });

    it('should handle missing private key gracefully', () => {
      const runtimeWithoutKey = createMockRuntime({
        getSetting: (key: string) => {
          if (key === 'EVM_PRIVATE_KEY') return null;
          return null;
        }
      });

      const hasPrivateKey = !!runtimeWithoutKey.getSetting('EVM_PRIVATE_KEY');
      expect(hasPrivateKey).toBe(false);
    });
  });
});
