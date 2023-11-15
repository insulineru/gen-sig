const ethers = require('ethers');
const { hashDomain } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');


async function main() {
	// example data
	let domainSeparator =
		'0x7f9f752009a0fba436a94f6b7c2421e7b480fc4aca9ab399f5cae3a654dd2403';
	let signerPrivateKey =
		'1111111111111111111111111111111111111111111111111111111111111111';
	let marketId = '200';
	let accountId = '170141183460469231731687303715884105756';
	let sizeDelta = '1000000000000000000';
	let settlementStrategyId = '0';
	let acceptablePrice =
		'115792089237316195423570985008687907853269984665640564039457584007913129639935';
	let isReduceOnly = false;
	let trackingCode =
		'0x4b57454e54410000000000000000000000000000000000000000000000000000';
	let referrer = '0xF510a2Ff7e9DD7e18629137adA4eb56B9c13E885';
	let nonce = '0';
	let requireVerified = false;
	let trustedExecutor = '0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496';
	let maxExecutorFee =
		'115792089237316195423570985008687907853269984665640564039457584007913129639935';
	let conditions = [];

	generateSignature(
		signerPrivateKey,
		domainSeparator,
		marketId,
		accountId,
		sizeDelta,
		settlementStrategyId,
		acceptablePrice,
		isReduceOnly,
		trackingCode,
		referrer,
		nonce,
		requireVerified,
		trustedExecutor,
		maxExecutorFee,
		conditions
	)
		.then((signature) => {
			console.log('Signature with signingKey:', signature);
		})
		.catch((error) => {
			console.error('Error signing message:', error);
		});

	generateSignatureViemTypedData(
		signerPrivateKey,
		domainSeparator,
		marketId,
		accountId,
		sizeDelta,
		settlementStrategyId,
		acceptablePrice,
		isReduceOnly,
		trackingCode,
		referrer,
		nonce,
		requireVerified,
		trustedExecutor,
		maxExecutorFee,
		conditions
	)
		.then((signature) => {
			console.log('Signature with viem signTypedData:', signature);
		})
		.catch((error) => {
			console.error('Error signing message:', error);
		});

	generateSignatureTypedData(
		signerPrivateKey,
		domainSeparator,
		marketId,
		accountId,
		sizeDelta,
		settlementStrategyId,
		acceptablePrice,
		isReduceOnly,
		trackingCode,
		referrer,
		nonce,
		requireVerified,
		trustedExecutor,
		maxExecutorFee,
		conditions
	)
		.then((signature) => {
			console.log('Signature with ethers signTypedData:', signature);
		})
		.catch((error) => {
			console.error('Error signing message:', error);
		});
}

async function generateSignatureViemTypedData(
	pk, // private key,
	domainSeparator, // can get this from the engine contract (i.e. engine.DOMAIN_SEPARATOR())
	marketId,
	accountId,
	sizeDelta,
	settlementStrategyId,
	acceptablePrice,
	isReduceOnly,
	trackingCode,
	referrer,
	nonce,
	requireVerified,
	trustedExecutor,
	maxExecutorFee,
	conditions
) {
	const account = privateKeyToAccount(pk)
	const signer = account.address
	console.log(signer)

	let orderDetails = {
		marketId: BigInt(marketId),
		accountId: BigInt(accountId),
		sizeDelta: BigInt(sizeDelta),
		settlementStrategyId: BigInt(settlementStrategyId),
		acceptablePrice: BigInt(acceptablePrice),
		isReduceOnly: isReduceOnly,
		trackingCode: trackingCode,
		referrer: referrer,
	};

	// define the conditional order struct
	let conditionalOrder = {
		orderDetails: orderDetails,
		signer: signer,
		nonce: BigInt(nonce),
		requireVerified: requireVerified,
		trustedExecutor: trustedExecutor,
		maxExecutorFee: BigInt(maxExecutorFee),
		conditions: conditions,
	};

	const domain = hashDomain({
		domain: {
			name: 'SMv3: OrderBook',
			version: '1',
			chainId: '84531',
			verifyingContract: '0x13eBcd3aD7B4Aa0595Fe57085C62c4f9CaDdB000',
		},
		types: {
			EIP712Domain: [
				{ name: 'name', type: 'string'},
				{ name: 'version', type: 'string'},
				{ name: 'chainId', type: 'uint256'},
				{ name: 'verifyingContract', type: 'address'},
			]
		}
	})

	console.log(domain === domainSeparator)

	const signed = account.signTypedData({
		domain: {
			name: 'SMv3: OrderBook',
			version: '1',
			chainId: '84531',
			verifyingContract: '0x13eBcd3aD7B4Aa0595Fe57085C62c4f9CaDdB000',
		},
		types: {
				OrderDetails: [
					{ name: 'marketId', type: 'uint128' },
					{ name: 'accountId', type: 'uint128' },
					{ name: 'sizeDelta', type: 'int128' },
					{ name: 'settlementStrategyId', type: 'uint128' },
					{ name: 'acceptablePrice', type: 'uint256' },
					{ name: 'isReduceOnly', type: 'bool' },
					{ name: 'trackingCode', type: 'bytes32' },
					{ name: 'referrer', type: 'address' },
				],
				ConditionalOrder: [
					{ name: 'orderDetails', type: 'OrderDetails' },
					{ name: 'signer', type: 'address' },
					{ name: 'nonce', type: 'uint256' },
					{ name: 'requireVerified', type: 'bool' },
					{ name: 'trustedExecutor', type: 'address' },
					{ name: 'maxExecutorFee', type: 'uint256' },
					{ name: 'conditions', type: 'bytes[]' },
				],
		},
		primaryType: "ConditionalOrder",
		message: {
			...conditionalOrder
		}
	})

	return signed
}

async function generateSignatureTypedData(
	pk, // private key,
	domainSeparator, // can get this from the engine contract (i.e. engine.DOMAIN_SEPARATOR())
	marketId,
	accountId,
	sizeDelta,
	settlementStrategyId,
	acceptablePrice,
	isReduceOnly,
	trackingCode,
	referrer,
	nonce,
	requireVerified,
	trustedExecutor,
	maxExecutorFee,
	conditions
) {
	const wallet = new ethers.Wallet(pk);
	const signer = wallet.address;

	let orderDetails = {
		marketId: BigInt(marketId),
		accountId: BigInt(accountId),
		sizeDelta: BigInt(sizeDelta),
		settlementStrategyId: BigInt(settlementStrategyId),
		acceptablePrice: BigInt(acceptablePrice),
		isReduceOnly: isReduceOnly,
		trackingCode: trackingCode,
		referrer: referrer,
	};

	// define the conditional order struct
	let conditionalOrder = {
		orderDetails: orderDetails,
		signer: signer,
		nonce: BigInt(nonce),
		requireVerified: requireVerified,
		trustedExecutor: trustedExecutor,
		maxExecutorFee: BigInt(maxExecutorFee),
		conditions: conditions,
	};

	const signed = await wallet.signTypedData({
			name: 'SMv3: OrderBook',
			version: '1',
			chainId: '84531',
			verifyingContract: '0x13eBcd3aD7B4Aa0595Fe57085C62c4f9CaDdB000',
		},
		{
				OrderDetails: [
					{ name: 'marketId', type: 'uint128' },
					{ name: 'accountId', type: 'uint128' },
					{ name: 'sizeDelta', type: 'int128' },
					{ name: 'settlementStrategyId', type: 'uint128' },
					{ name: 'acceptablePrice', type: 'uint256' },
					{ name: 'isReduceOnly', type: 'bool' },
					{ name: 'trackingCode', type: 'bytes32' },
					{ name: 'referrer', type: 'address' },
				],
				ConditionalOrder: [
					{ name: 'orderDetails', type: 'OrderDetails' },
					{ name: 'signer', type: 'address' },
					{ name: 'nonce', type: 'uint256' },
					{ name: 'requireVerified', type: 'bool' },
					{ name: 'trustedExecutor', type: 'address' },
					{ name: 'maxExecutorFee', type: 'uint256' },
					{ name: 'conditions', type: 'bytes[]' },
				],
		},
		conditionalOrder
	)

	return signed
}

async function generateSignature(
	pk, // private key,
	domainSeparator, // can get this from the engine contract (i.e. engine.DOMAIN_SEPARATOR())
	marketId,
	accountId,
	sizeDelta,
	settlementStrategyId,
	acceptablePrice,
	isReduceOnly,
	trackingCode,
	referrer,
	nonce,
	requireVerified,
	trustedExecutor,
	maxExecutorFee,
	conditions
) {
	// define class for encoding data
	let abi = new ethers.AbiCoder();

	const wallet = new ethers.Wallet(pk);
	const signer = wallet.address;

	// `keccak256` provides direct hashing function
	// that doesn't involve ABI encoding
	let ORDER_DETAILS_TYPEHASH = ethers.keccak256(
		ethers.toUtf8Bytes(
			'OrderDetails(uint128 marketId,uint128 accountId,int128 sizeDelta,uint128 settlementStrategyId,uint256 acceptablePrice,bool isReduceOnly,bytes32 trackingCode,address referrer)'
		)
	);

	// `keccak256` provides direct hashing function
	// that doesn't involve ABI encoding
	let CONDITIONAL_ORDER_TYPEHASH = ethers.keccak256(
		ethers.toUtf8Bytes(
			'ConditionalOrder(OrderDetails orderDetails,address signer,uint256 nonce,bool requireVerified,address trustedExecutor,uint256 maxExecutorFee,bytes[] conditions)OrderDetails(uint128 marketId,uint128 accountId,int128 sizeDelta,uint128 settlementStrategyId,uint256 acceptablePrice,bool isReduceOnly,bytes32 trackingCode,address referrer)'
		)
	);

	// define the order details struct
	let orderDetails = {
		marketId: marketId,
		accountId: accountId,
		sizeDelta: sizeDelta,
		settlementStrategyId: settlementStrategyId,
		acceptablePrice: acceptablePrice,
		isReduceOnly: isReduceOnly,
		trackingCode: trackingCode,
		referrer: referrer,
	};

	// define the conditional order struct
	let conditionalOrder = {
		orderDetails: orderDetails,
		signer: signer,
		nonce: nonce,
		requireVerified: requireVerified,
		trustedExecutor: trustedExecutor,
		maxExecutorFee: maxExecutorFee,
		conditions: conditions,
	};

	// hash of the ABI-encoded parameters
	let orderDetailsHash = ethers.keccak256(
		abi.encode(
			[
				'bytes32',
				'uint128',
				'uint128',
				'int128',
				'uint128',
				'uint256',
				'bool',
				'bytes32',
				'address',
			],
			[
				ORDER_DETAILS_TYPEHASH,
				orderDetails.marketId,
				orderDetails.accountId,
				orderDetails.sizeDelta,
				orderDetails.settlementStrategyId,
				orderDetails.acceptablePrice,
				orderDetails.isReduceOnly,
				orderDetails.trackingCode,
				orderDetails.referrer,
			]
		)
	);

	// hash of the ABI-encoded parameters
	const conditionalOrderHash = ethers.keccak256(
		abi.encode(
			[
				'bytes32',
				'bytes32',
				'address',
				'uint256',
				'bool',
				'address',
				'uint256',
				'bytes32[]',
			],
			[
				CONDITIONAL_ORDER_TYPEHASH,
				orderDetailsHash,
				conditionalOrder.signer,
				conditionalOrder.nonce,
				conditionalOrder.requireVerified,
				conditionalOrder.trustedExecutor,
				conditionalOrder.maxExecutorFee,
				conditionalOrder.conditions.map((condition) =>
					ethers.keccak256(condition)
				),
			]
		)
	);

	// To simulate `abi.encodePacked`, concatenate the encoded elements
	// For a simple packed encoding, you can just concatenate the strings directly
	// Since we're dealing with hex strings, ensure they are properly formatted without the '0x' prefix when concatenating
	let packedData = ethers.solidityPacked(
		['string', 'bytes32', 'bytes32'],
		['\x19\x01', domainSeparator, conditionalOrderHash]
	);

	// Compute the Keccak-256 hash of the packed data
	const messageHash = ethers.keccak256(packedData);

	// Sign the hash
	const signingKey = wallet.signingKey;
	const signature = signingKey.sign(messageHash).serialized;

	return signature;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
