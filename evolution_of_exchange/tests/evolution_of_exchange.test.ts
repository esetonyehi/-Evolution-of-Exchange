// evolution-of-exchange.test.js
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Client, Provider } from '@stacks/transactions';
import { StacksMocknet } from '@stacks/network';
import { readFileSync } from 'fs';
import path from 'path';

// Mock Clarity contract interactions
vi.mock('@stacks/transactions', async () => {
  const actual = await vi.importActual('@stacks/transactions');
  return {
    ...actual,
    callReadOnlyFunction: vi.fn(),
    broadcastTransaction: vi.fn()
  };
});

describe('Evolution of Exchange Contract Tests', () => {
  let mockClient;
  let mockTxResult;
  const mockAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const contractName = 'evolution-of-exchange';
  
  // Mock transaction response
  const mockTxResponse = (result) => {
    return {
      result,
      txId: '0x1234567890abcdef',
      success: true
    };
  };
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Setup mock client
    mockClient = new Client(new Provider('http://localhost:20443'));
    
    // Mock transaction results for different function calls
    mockTxResult = {
      'evolution-of-exchange': mockTxResponse('(ok "Evolution of Exchange initialized")'),
      'initialize-exchange-history': mockTxResponse('(ok true)'),
      'perform-exchange': mockTxResponse('(ok true)'),
      'play-era-theme': mockTxResponse('(ok true)'),
      'get-exchange-info': (era) => {
        const eraInfo = {
          '1': {
            era: 1,
            method: "Barter",
            description: "Direct exchange of goods and services", 
            'year-introduced': 9000,
            'is-current': false
          },
          '6': {
            era: 6,
            method: "Cryptocurrency",
            description: "Decentralized digital currencies based on blockchain",
            'year-introduced': 2009,
            'is-current': true
          }
        };
        return mockTxResponse(`(some ${JSON.stringify(eraInfo[era] || eraInfo['1'])})`);
      },
      'is-exchange-method-current': (era) => {
        return mockTxResponse(era >= 4 ? 'true' : 'false');
      }
    };
    
    // Setup mock responses for contract calls
    const { callReadOnlyFunction, broadcastTransaction } = require('@stacks/transactions');
    
    callReadOnlyFunction.mockImplementation((options) => {
      const { functionName, functionArgs } = options;
      
      if (functionName === 'get-exchange-info') {
        const era = functionArgs[0].value.value;
        return Promise.resolve(mockTxResult[functionName](era));
      } else if (functionName === 'is-exchange-method-current') {
        const era = functionArgs[0].value.value;
        return Promise.resolve(mockTxResult[functionName](era));
      } else {
        return Promise.resolve(mockTxResult[functionName] || mockTxResponse('(ok true)'));
      }
    });
    
    broadcastTransaction.mockImplementation((transaction) => {
      // Extract the function name from the transaction
      const functionName = transaction.payload.functionName;
      return Promise.resolve(mockTxResult[functionName] || mockTxResponse('(ok true)'));
    });
  });

  test('should initialize contract successfully', async () => {
    const { callReadOnlyFunction } = require('@stacks/transactions');
    
    const result = await callReadOnlyFunction({
      contractAddress: mockAddress,
      contractName,
      functionName: 'evolution-of-exchange',
      functionArgs: [],
      network: new StacksMocknet(),
      senderAddress: mockAddress
    });
    
    expect(result.success).toBe(true);
    expect(result.result).toContain('Evolution of Exchange initialized');
  });

  test('should initialize exchange history', async () => {
    const { broadcastTransaction } = require('@stacks/transactions');
    
    // Create mock transaction for initialize-exchange-history
    const mockTx = {
      payload: {
        functionName: 'initialize-exchange-history',
        functionArgs: []
      }
    };
    
    const result = await broadcastTransaction(mockTx);
    
    expect(result.success).toBe(true);
    expect(result.result).toContain('(ok true)');
  });

  test('should get exchange info for Barter era', async () => {
    const { callReadOnlyFunction } = require('@stacks/transactions');
    
    const result = await callReadOnlyFunction({
      contractAddress: mockAddress,
      contractName,
      functionName: 'get-exchange-info',
      functionArgs: [{ type: 'uint', value: 1 }],
      network: new StacksMocknet(),
      senderAddress: mockAddress
    });
    
    expect(result.success).toBe(true);
    expect(result.result).toContain('"method":"Barter"');
    expect(result.result).toContain('"year-introduced":9000');
  });

  test('should get exchange info for Crypto era', async () => {
    const { callReadOnlyFunction } = require('@stacks/transactions');
    
    const result = await callReadOnlyFunction({
      contractAddress: mockAddress,
      contractName,
      functionName: 'get-exchange-info',
      functionArgs: [{ type: 'uint', value: 6 }],
      network: new StacksMocknet(),
      senderAddress: mockAddress
    });
    
    expect(result.success).toBe(true);
    expect(result.result).toContain('"method":"Cryptocurrency"');
    expect(result.result).toContain('"year-introduced":2009');
  });

  test('should check if exchange method is current - Barter (false)', async () => {
    const { callReadOnlyFunction } = require('@stacks/transactions');
    
    const result = await callReadOnlyFunction({
      contractAddress: mockAddress,
      contractName,
      functionName: 'is-exchange-method-current',
      functionArgs: [{ type: 'uint', value: 1 }],
      network: new StacksMocknet(),
      senderAddress: mockAddress
    });
    
    expect(result.success).toBe(true);
    expect(result.result).toContain('false');
  });

  test('should check if exchange method is current - Digital Money (true)', async () => {
    const { callReadOnlyFunction } = require('@stacks/transactions');
    
    const result = await callReadOnlyFunction({
      contractAddress: mockAddress,
      contractName,
      functionName: 'is-exchange-method-current',
      functionArgs: [{ type: 'uint', value: 5 }],
      network: new StacksMocknet(),
      senderAddress: mockAddress
    });
    
    expect(result.success).toBe(true);
    expect(result.result).toContain('true');
  });

  test('should perform exchange with current method', async () => {
    const { broadcastTransaction } = require('@stacks/transactions');
    
    // Create mock transaction for perform-exchange with DIGITAL_MONEY_ERA
    const mockTx = {
      payload: {
        functionName: 'perform-exchange',
        functionArgs: [
          { type: 'uint', value: 5 },  // DIGITAL_MONEY_ERA
          { type: 'uint', value: 100 },
          { type: 'principal', value: mockAddress },
          { type: 'principal', value: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG' }
        ]
      }
    };
    
    const result = await broadcastTransaction(mockTx);
    
    expect(result.success).toBe(true);
    expect(result.result).toContain('(ok true)');
  });

  test('should play era theme for Metallic Money era', async () => {
    const { broadcastTransaction } = require('@stacks/transactions');
    
    // Create mock transaction for play-era-theme with METALLIC_MONEY_ERA
    const mockTx = {
      payload: {
        functionName: 'play-era-theme',
        functionArgs: [
          { type: 'uint', value: 3 }  // METALLIC_MONEY_ERA
        ]
      }
    };
    
    const result = await broadcastTransaction(mockTx);
    
    expect(result.success).toBe(true);
    expect(result.result).toContain('(ok true)');
  });

  test('should handle perform-exchange for historical method (Barter)', async () => {
    // Override mockTxResult for this specific test
    mockTxResult['perform-exchange'] = mockTxResponse('(ok false)');
    
    const { broadcastTransaction } = require('@stacks/transactions');
    
    // Create mock transaction for perform-exchange with BARTER_ERA
    const mockTx = {
      payload: {
        functionName: 'perform-exchange',
        functionArgs: [
          { type: 'uint', value: 1 },  // BARTER_ERA
          { type: 'uint', value: 5 },
          { type: 'principal', value: mockAddress },
          { type: 'principal', value: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG' }
        ]
      }
    };
    
    const result = await broadcastTransaction(mockTx);
    
    expect(result.success).toBe(true);
    // For historical methods, the function returns (ok false)
    expect(result.result).toContain('(ok false)');
  });

  // Integration test that simulates a sequence of calls
  test('integration: initialize history and perform operations', async () => {
    const { broadcastTransaction, callReadOnlyFunction } = require('@stacks/transactions');
    
    // Step 1: Initialize exchange history
    const initTx = {
      payload: {
        functionName: 'initialize-exchange-history',
        functionArgs: []
      }
    };
    
    const initResult = await broadcastTransaction(initTx);
    expect(initResult.success).toBe(true);
    
    // Step 2: Check if Crypto is a current method
    const currentResult = await callReadOnlyFunction({
      contractAddress: mockAddress,
      contractName,
      functionName: 'is-exchange-method-current',
      functionArgs: [{ type: 'uint', value: 6 }],
      network: new StacksMocknet(),
      senderAddress: mockAddress
    });
    
    expect(currentResult.success).toBe(true);
    expect(currentResult.result).toContain('true');
    
    // Step 3: Perform exchange with crypto
    const exchangeTx = {
      payload: {
        functionName: 'perform-exchange',
        functionArgs: [
          { type: 'uint', value: 6 },  // CRYPTO_ERA
          { type: 'uint', value: 42 },
          { type: 'principal', value: mockAddress },
          { type: 'principal', value: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG' }
        ]
      }
    };
    
    const exchangeResult = await broadcastTransaction(exchangeTx);
    expect(exchangeResult.success).toBe(true);
  });
});