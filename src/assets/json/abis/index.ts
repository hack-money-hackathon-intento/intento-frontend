import { Abi } from 'viem'

export const intentoAbi = [
	{
		inputs: [],
		stateMutability: 'nonpayable',
		type: 'constructor'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_account',
				type: 'address'
			}
		],
		name: 'ALREADY_REGISTERED',
		type: 'error'
	},
	{
		inputs: [],
		name: 'INSUFFICIENT_ALLOWANCE',
		type: 'error'
	},
	{
		inputs: [],
		name: 'INSUFFICIENT_BALANCE',
		type: 'error'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_address',
				type: 'address'
			}
		],
		name: 'INVALID_ADDRESS',
		type: 'error'
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_value',
				type: 'uint256'
			}
		],
		name: 'INVALID_VALUE',
		type: 'error'
	},
	{
		inputs: [],
		name: 'InvalidInitialization',
		type: 'error'
	},
	{
		inputs: [],
		name: 'MISMATCH',
		type: 'error'
	},
	{
		inputs: [],
		name: 'NATIVE_TOKEN_NOT_SUPPORTED',
		type: 'error'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_account',
				type: 'address'
			}
		],
		name: 'NOT_REGISTERED',
		type: 'error'
	},
	{
		inputs: [],
		name: 'NotInitializing',
		type: 'error'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'owner',
				type: 'address'
			}
		],
		name: 'OwnableInvalidOwner',
		type: 'error'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address'
			}
		],
		name: 'OwnableUnauthorizedAccount',
		type: 'error'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'token',
				type: 'address'
			}
		],
		name: 'SafeERC20FailedOperation',
		type: 'error'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_account',
				type: 'address'
			},
			{
				internalType: 'address',
				name: '_token',
				type: 'address'
			}
		],
		name: 'TOKEN_NOT_ENABLED',
		type: 'error'
	},
	{
		inputs: [],
		name: 'TRANSFER_FAILED',
		type: 'error'
	},
	{
		inputs: [],
		name: 'ZERO_BYTES',
		type: 'error'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'token',
				type: 'address'
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'to',
				type: 'address'
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256'
			}
		],
		name: 'FundsRecovered',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint64',
				name: 'version',
				type: 'uint64'
			}
		],
		name: 'Initialized',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'previousOwner',
				type: 'address'
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'newOwner',
				type: 'address'
			}
		],
		name: 'OwnershipTransferred',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'bytes',
				name: 'orderId',
				type: 'bytes'
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'from',
				type: 'address'
			},
			{
				indexed: false,
				internalType: 'address[]',
				name: 'tokens',
				type: 'address[]'
			},
			{
				indexed: false,
				internalType: 'uint256[]',
				name: 'amounts',
				type: 'uint256[]'
			},
			{
				indexed: false,
				internalType: 'bytes[]',
				name: 'routes',
				type: 'bytes[]'
			},
			{
				indexed: false,
				internalType: 'bool',
				name: 'hasEns',
				type: 'bool'
			}
		],
		name: 'PaymentExecuted',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'account',
				type: 'address'
			},
			{
				indexed: false,
				internalType: 'address[]',
				name: 'tokens',
				type: 'address[]'
			}
		],
		name: 'Registered',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'account',
				type: 'address'
			},
			{
				indexed: false,
				internalType: 'address[]',
				name: 'tokens',
				type: 'address[]'
			},
			{
				indexed: false,
				internalType: 'bool[]',
				name: 'enableds',
				type: 'bool[]'
			}
		],
		name: 'TokensSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'account',
				type: 'address'
			}
		],
		name: 'Unregistered',
		type: 'event'
	},
	{
		stateMutability: 'payable',
		type: 'fallback'
	},
	{
		inputs: [],
		name: 'NATIVE',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_account',
				type: 'address'
			},
			{
				internalType: 'address[]',
				name: '_tokens',
				type: 'address[]'
			}
		],
		name: 'areTokensEnabled',
		outputs: [
			{
				internalType: 'bool[]',
				name: 'enableds',
				type: 'bool[]'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_amount',
				type: 'uint256'
			}
		],
		name: 'calculateFee',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'bytes',
				name: '_orderId',
				type: 'bytes'
			},
			{
				internalType: 'address',
				name: '_from',
				type: 'address'
			},
			{
				internalType: 'address[]',
				name: '_tokens',
				type: 'address[]'
			},
			{
				internalType: 'uint256[]',
				name: '_amounts',
				type: 'uint256[]'
			},
			{
				internalType: 'bytes[]',
				name: '_routes',
				type: 'bytes[]'
			},
			{
				internalType: 'bool',
				name: '_hasEns',
				type: 'bool'
			}
		],
		name: 'executePayment',
		outputs: [],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_token',
				type: 'address'
			}
		],
		name: 'getBalance',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'getFee',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'getFeeBps',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		stateMutability: 'pure',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_owner',
				type: 'address'
			},
			{
				internalType: 'uint256',
				name: '_fee',
				type: 'uint256'
			}
		],
		name: 'initialize',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_account',
				type: 'address'
			}
		],
		name: 'isRegistered',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_token',
				type: 'address'
			},
			{
				internalType: 'address',
				name: '_to',
				type: 'address'
			}
		],
		name: 'recoverFunds',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address[]',
				name: '_tokens',
				type: 'address[]'
			},
			{
				internalType: 'bool[]',
				name: '_enableds',
				type: 'bool[]'
			}
		],
		name: 'register',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [],
		name: 'renounceOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_fee',
				type: 'uint256'
			}
		],
		name: 'setFee',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address[]',
				name: '_tokens',
				type: 'address[]'
			},
			{
				internalType: 'bool[]',
				name: '_enableds',
				type: 'bool[]'
			}
		],
		name: 'setTokens',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'newOwner',
				type: 'address'
			}
		],
		name: 'transferOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [],
		name: 'unregister',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		stateMutability: 'payable',
		type: 'receive'
	}
] as Abi
