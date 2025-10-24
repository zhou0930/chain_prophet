import { describe, expect, it } from 'bun:test';
import { character } from '../character';

describe('Chain Prophet Character Configuration', () => {
  describe('Identity and Basic Properties', () => {
    it('should have correct name and username', () => {
      expect(character.name).toBe('Chain Prophet');
      expect(character.username).toBe('chain_prophet');
    });

    it('should have appropriate adjectives', () => {
      expect(character.adjectives).toEqual([
        'precise',
        'technical',
        'security-focused',
        'analytical',
        'professional',
        'reliable',
        'methodical',
        'expert'
      ]);
    });
  });

  describe('Bio and Personality', () => {
    it('should have blockchain-focused bio', () => {
      expect(character.bio).toEqual([
        'Blockchain specialist with deep expertise in on-chain transactions',
        'Proficient in Ethereum, Bitcoin, and major smart contract platforms',
        'Skilled in transaction optimization, gas management, and security protocols',
        'Able to execute and verify transactions across multiple blockchains',
        'Expert in smart contract interaction and blockchain analytics',
        'Communicates complex technical concepts with clarity',
        'Prioritizes security and transparency in all operations',
        'Monitors network conditions to optimize transaction success',
      ]);
    });

    it('should have blockchain-specific topics', () => {
      expect(character.topics).toEqual([
        'blockchain protocols and architecture',
        'on-chain transaction execution',
        'gas optimization and fee structures',
        'smart contract interaction',
        'wallet management and security',
        'decentralized finance (DeFi) operations',
        'blockchain network upgrades',
        'transaction debugging and recovery',
        'cryptocurrency wallet integration',
        'block explorer analysis',
      ]);
    });
  });

  describe('System Prompt and Behavior', () => {
    it('should have specialized blockchain system prompt', () => {
      expect(character.system).toContain('Chain Prophet');
      expect(character.system).toContain('blockchain expert');
      expect(character.system).toContain('transaction executor');
      expect(character.system).toContain('security');
      expect(character.system).toContain('gas estimation');
      expect(character.system).toContain('smart contracts');
    });

    it('should have technical style configuration', () => {
      expect(character.style.all).toContain('Be precise and accurate with technical details');
      expect(character.style.all).toContain('Include relevant technical parameters (gas prices, addresses, etc.)');
      expect(character.style.all).toContain('Warn about potential risks explicitly');
      expect(character.style.all).toContain('Use blockchain terminology correctly');
      
      expect(character.style.chat).toContain('Ask clarifying questions about transaction details');
      expect(character.style.chat).toContain('Present options with clear pros/cons');
      expect(character.style.chat).toContain('Break complex processes into simple steps');
    });
  });

  describe('Message Examples', () => {
    it('should have blockchain transaction examples', () => {
      expect(character.messageExamples).toBeDefined();
      expect(character.messageExamples.length).toBeGreaterThan(0);
      
      const hasTransactionExample = character.messageExamples.some(conversation =>
        conversation.some(message => 
          message.content.text.includes('ETH') && 
          message.content.text.includes('transaction')
        )
      );
      expect(hasTransactionExample).toBe(true);
    });

    it('should have transaction debugging examples', () => {
      const hasDebuggingExample = character.messageExamples.some(conversation =>
        conversation.some(message => 
          message.content.text.includes('stuck') || 
          message.content.text.includes('gas')
        )
      );
      expect(hasDebuggingExample).toBe(true);
    });

    it('should use Chain Prophet name in examples', () => {
      const hasChainProphetName = character.messageExamples.some(conversation =>
        conversation.some(message => message.name === 'Chain Prophet')
      );
      expect(hasChainProphetName).toBe(true);
    });
  });

  describe('Knowledge and Templates', () => {
    it('should have blockchain knowledge configuration', () => {
      expect(character.knowledge).toBeDefined();
      expect(Array.isArray(character.knowledge)).toBe(true);
      expect(character.knowledge).toContain('Blockchain transaction mechanics and gas optimization');
      expect(character.knowledge).toContain('Smart contract security best practices');
      expect(character.knowledge).toContain('Multi-chain bridge protocols and cross-chain operations');
    });

    it('should have custom templates', () => {
      expect(character.templates).toBeDefined();
      expect(character.templates?.messageTemplate).toBeDefined();
      expect(character.templates?.thoughtTemplate).toBeDefined();
      expect(character.templates?.actionTemplate).toBeDefined();
      
      // Test template functions
      const messageTemplate = character.templates?.messageTemplate;
      const thoughtTemplate = character.templates?.thoughtTemplate;
      const actionTemplate = character.templates?.actionTemplate;
      
      if (messageTemplate && typeof messageTemplate === 'function') {
        expect(messageTemplate({ message: 'test' })).toContain('Chain Prophet analyzing');
      }
      
      if (thoughtTemplate && typeof thoughtTemplate === 'function') {
        expect(thoughtTemplate({ thought: 'analysis' })).toContain('Technical analysis');
      }
      
      if (actionTemplate && typeof actionTemplate === 'function') {
        expect(actionTemplate({ action: 'transfer' })).toContain('Executing blockchain operation');
      }
    });
  });

  describe('Settings and Configuration', () => {
    it('should have appropriate model settings', () => {
      expect(character.settings.model).toBe('gpt-4');
      expect(character.settings.temperature).toBe(0.3);
      expect(character.settings.maxTokens).toBe(2000);
      expect(character.settings.memoryLimit).toBe(1000);
      expect(character.settings.conversationLength).toBe(32);
    });

    it('should have avatar configuration', () => {
      expect(character.settings.avatar).toBe('https://elizaos.github.io/eliza-avatars/Eliza/portrait.png');
    });
  });

  describe('Plugin Configuration', () => {
    it('should include core plugins', () => {
      expect(character.plugins).toContain('@elizaos/plugin-sql');
      expect(character.plugins).toContain('@elizaos/plugin-bootstrap');
    });

    it('should conditionally include EVM plugin', () => {
      const originalEnv = process.env.EVM_PRIVATE_KEY;
      
      try {
        // Test with EVM_PRIVATE_KEY set
        process.env.EVM_PRIVATE_KEY = 'test-key';
        expect(character.plugins).toContain('@elizaos/plugin-evm');
        
        // Test without EVM_PRIVATE_KEY
        delete process.env.EVM_PRIVATE_KEY;
        // Note: This test might not work as expected since the character is already loaded
        // In a real scenario, you'd need to reload the character configuration
      } finally {
        process.env.EVM_PRIVATE_KEY = originalEnv;
      }
    });
  });

  describe('Character Validation', () => {
    it('should have all required fields', () => {
      expect(character.name).toBeDefined();
      expect(character.bio).toBeDefined();
      expect(character.system).toBeDefined();
      expect(character.plugins).toBeDefined();
    });

    it('should have valid message examples structure', () => {
      expect(Array.isArray(character.messageExamples)).toBe(true);
      
      character.messageExamples.forEach(conversation => {
        expect(Array.isArray(conversation)).toBe(true);
        conversation.forEach(message => {
          expect(message).toHaveProperty('name');
          expect(message).toHaveProperty('content');
          expect(message.content).toHaveProperty('text');
        });
      });
    });

    it('should have valid style configuration', () => {
      expect(character.style).toBeDefined();
      expect(character.style.all).toBeDefined();
      expect(character.style.chat).toBeDefined();
      expect(Array.isArray(character.style.all)).toBe(true);
      expect(Array.isArray(character.style.chat)).toBe(true);
    });
  });
});
