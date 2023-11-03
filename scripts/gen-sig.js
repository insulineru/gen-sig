const hre = require('hardhat');

async function main() {
	// define data
	let data;

	if (data != null) {
		generateSignature(data)
			.then((signature) => {
				console.log('Signature:', signature);
			})
			.catch((error) => {
				console.error('Error signing message:', error);
			});
	}
}

function generateSignature(
	pk, // private key
	domainSeparator, // can get this from the engine contract (i.e. engine.DOMAIN_SEPARATOR())
	marketId,
	accountId,
	sizeDelta,
	settlementStrategyId,
	acceptablePrice,
	isReduceOnly,
	trackingCode,
	referrer,
	signer,
	nonce,
	requireVerified,
	trustedExecutor,
	maxExecutorFee,
	conditions
) {
	// `keccak256` provides direct hashing function
	// that doesn't involve ABI encoding
	let ORDER_DETAILS_TYPEHASH = hre.ethers.keccak256(
		hre.ethers.toUtf8Bytes(
			'OrderDetails(uint128 marketId,uint128 accountId,int128 sizeDelta,uint128 settlementStrategyId,uint256 acceptablePrice,bool isReduceOnly,bytes32 trackingCode,address referrer)'
		)
	);

	// `keccak256` provides direct hashing function
	// that doesn't involve ABI encoding
	let CONDITIONAL_ORDER_TYPEHASH = hre.ethers.keccak256(
		hre.ethers.toUtf8Bytes(
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

	// Use `solidityKeccak256` to compute the Keccak-256
	// hash of the ABI-encoded parameters
	let orderDetailsHash = hre.ethers.solidityKeccak256(
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
	);

	// Use `solidityKeccak256` to compute the Keccak-256
	// hash of the ABI-encoded parameters
	const conditionalOrderHash = hre.ethers.solidityKeccak256(
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
				ethers.utils.keccak256(condition)
			),
		]
	);

	// To simulate `abi.encodePacked`, concatenate the encoded elements
	// For a simple packed encoding, you can just concatenate the strings directly
	// Since we're dealing with hex strings, ensure they are properly formatted without the '0x' prefix when concatenating
	let packedData = ethers.utils.solidityPack(
		['string', 'bytes32', 'bytes32'],
		['\x19\x01', domainSeparator, conditionalOrderHash]
	);

	// Compute the Keccak-256 hash of the packed data
	const messageHash = ethers.utils.keccak256(packedData);

	// Sign the hash
	const wallet = new ethers.Wallet(pk);
	const signature = wallet.signMessage(ethers.utils.arrayify(messageHash));

	return signature;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
