const { Bot, InlineKeyboard } = require("grammy");
const { bip39, BigNumber } = require("@okxweb3/crypto-lib");
const { EthWallet } = require("@okxweb3/coin-ethereum");
const fetch = require("node-fetch");
const crypto = require("crypto");
const { Web3 } = require("web3");
const web3 = new Web3(
  "https://endpoints.omniatech.io/v1/xlayer/mainnet/public",
); // Add your XLayer RPC URL
require("dotenv").config();

// Validate required environment variables
const REQUIRED_ENV = [
  "TELEGRAM_BOT_TOKEN",
  "OKX_PROJECT_ID",
  "OKX_API_KEY",
  "OKX_API_SECRET_KEY",
  "OKX_API_PASSPHRASE",
  "ENCRYPTION_KEY",
];

for (const env of REQUIRED_ENV) {
  if (!process.env[env]) {
    throw new Error(`Missing ${env} environment variable`);
  }
}

// Initialize bot and wallet
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
const wallet = new EthWallet();

// Constants
const API_BASE_URL = "https://www.okx.com";
const CHAIN_ID = "196";

// In-memory state management
const userStates = {};

// Helper function to update user state
function updateUserState(user, state) {
  userStates[user.id] = { ...userStates[user.id], ...state };
}

function clearUserState(user) {
  delete userStates[user.id];
}

// Helper function to generate API request URL
function getRequestUrl(path, params = {}) {
  const url = new URL(path, API_BASE_URL);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value),
  );
  return url.toString();
}

// Helper function to generate API headers
function getHeaders(method, path, body = "") {
  const timestamp = new Date().toISOString();
  const signString = timestamp + method.toUpperCase() + path + body;
  const signature = crypto
    .createHmac("sha256", process.env.OKX_API_SECRET_KEY)
    .update(signString)
    .digest("base64");

  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": process.env.OKX_API_KEY,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": process.env.OKX_API_PASSPHRASE,
    "OK-ACCESS-PROJECT": process.env.OKX_PROJECT_ID,
  };
}

// Helper function to send reply and update message ID
async function sendReply(ctx, text, options = {}) {
  const message = await ctx.reply(text, options);
  updateUserState(ctx.from, { messageId: message.message_id });
  return message;
}

async function createWalletAccount(user) {
  if (userStates[user.id]?.walletAccount) {
    return userStates[user.id].walletAccount;
  }

  try {
    // 1. Generate wallet components
    const mnemonic = bip39.generateMnemonic();
    const hdPath = await wallet.getDerivedPath({ index: 0 });
    const privateKey = await wallet.getDerivedPrivateKey({
      mnemonic,
      hdPath,
    });
    const newAddress = await wallet.getNewAddress({ privateKey });

    // 2. Prepare address data exactly as shown in docs
    const addresses = [
      {
        chainIndex: CHAIN_ID,
        address: newAddress.address.toLowerCase(),
      },
    ];

    // 3. Create request body matching docs example
    const createAccountBody = {
      addresses: addresses,
    };

    // 4. Make API request with correct endpoint
    const response = await fetch(
      getRequestUrl("/api/v5/wallet/account/create-wallet-account"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "OK-ACCESS-KEY": process.env.OKX_API_KEY,
          "OK-ACCESS-SIGN": getHeaders(
            "POST",
            "/api/v5/wallet/account/create-wallet-account",
            JSON.stringify(createAccountBody),
          )["OK-ACCESS-SIGN"],
          "OK-ACCESS-TIMESTAMP": new Date().toISOString(),
          "OK-ACCESS-PASSPHRASE": process.env.OKX_API_PASSPHRASE,
          "OK-ACCESS-PROJECT": process.env.OKX_PROJECT_ID,
        },
        body: JSON.stringify(createAccountBody),
      },
    );

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2)); // Add detailed logging

    if (data.code !== "0") {
      throw new Error(data.msg || "Failed to create account");
    }

    // 5. Store wallet info if successful
    updateUserState(user, {
      address: newAddress.address,
      privateKey: privateKey,
      publicKey: newAddress.publicKey,
      walletAccount: data.data[0].accountId, // Note: changed from walletAccount to accountId
    });

    return data.data[0].accountId; // Return accountId as per API docs
  } catch (error) {
    console.error("Failed to create wallet account:", error);
    // Add more detailed error logging
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
}

// Create or get existing wallet address
async function getOrCreateAddress(user) {
  if (userStates[user.id]?.address) {
    return userStates[user.id].address;
  }

  const mnemonic = bip39.generateMnemonic();
  const hdPath = await wallet.getDerivedPath({ index: 0 });
  const privateKey = await wallet.getDerivedPrivateKey({
    mnemonic,
    hdPath,
  });
  const newAddress = await wallet.getNewAddress({ privateKey });

  updateUserState(user, {
    address: newAddress.address,
    privateKey: privateKey,
    publicKey: newAddress.publicKey,
  });

  return newAddress.address;
}

//handleCreateWalletAccount
async function handleCreateWalletAccount(ctx) {
  try {
    clearUserState(ctx.from);
    const { from: user } = ctx;
    const walletAccount = await createWalletAccount(user);
    const userAddress = userStates[user.id].address;
    await sendReply(
      ctx,
      `Your new wallet account has been created!\n\nAccount ID: \`${walletAccount}\`\nWallet Address: \`${userAddress}\``,
      {
        parse_mode: "Markdown",
      },
    );
  } catch (error) {
    console.error("handleCreateWalletAccount error:", error);
    await sendReply(
      ctx,
      "An error occurred while creating your wallet account. Please try again later.",
    );
  }
}

// Start command handler
bot.command("start", async (ctx) => {
  console.log("Processing start command...");
  try {
    const { from: user } = ctx;
    const walletAccount = await createWalletAccount(user);
    const userAddress = userStates[user.id].address;
    const keyboard = new InlineKeyboard()
      .text("Check Balance", "check_balance")
      .row()
      .text("Export Key", "export_key")
      .row()
      .text("Create New Wallet", "create_wallet_account")
      .row()
      .text("Check Transaction Status", "check_status")
      .row()
      .text("Pin Message", "pin_message")
      .row()
      .text("Withdraw", "withdraw_OKB")
      .row()
      .text("Deposit", "deposit_OKB");

    await sendReply(
      ctx,
      `*Welcome to your XLayer Trading Bot!*\nYour Wallet Account ID is: \`${walletAccount}\`\n Your Wallet Address is: \`${userAddress}\` \nSelect an option below:`,
      { reply_markup: keyboard, parse_mode: "Markdown" },
    );
  } catch (error) {
    console.error("Error in start command:", error);
    await ctx.reply("Failed to initialize bot. Please try again later.");
  }
});

// Balance check handler
async function handleCheckBalance(ctx) {
  console.log("Checking balance...");
  const address = await getOrCreateAddress(ctx.from);

  try {
    const response = await fetch(
      getRequestUrl("/api/v5/wallet/asset/token-balances-by-address"),
      {
        method: "POST",
        headers: getHeaders(
          "POST",
          "/api/v5/wallet/asset/token-balances-by-address",
          JSON.stringify({
            address,
            tokenAddresses: [{ chainIndex: CHAIN_ID, tokenAddress: "" }],
          }),
        ),
        body: JSON.stringify({
          address,
          tokenAddresses: [{ chainIndex: CHAIN_ID, tokenAddress: "" }],
        }),
      },
    );

    const data = await response.json();
    console.log("Balance API Response:", JSON.stringify(data, null, 2));

    if (data.code === "0" && data.data?.[0]?.tokenAssets?.[0]) {
      const {
        balance,
        tokenPrice,
        symbol = "OKB",
      } = data.data[0].tokenAssets[0];
      const formattedBalance = parseFloat(balance).toFixed(8);
      const value = (parseFloat(balance) * parseFloat(tokenPrice)).toFixed(2);

      await sendReply(
        ctx,
        `Your XLayer ${symbol} balance:\n${formattedBalance} ${symbol} (USD ${value})`,
      );
    } else {
      throw new Error(data.msg || "No balance data received");
    }
  } catch (error) {
    console.error("Balance check error:", error);
    await ctx.reply(
      "An error occurred while checking your balance. Please try again later.",
    );
  }
}

// Deposit handler
async function handleDeposit(ctx) {
  console.log("Processing deposit request...");
  const address = await getOrCreateAddress(ctx.from);

  await sendReply(
    ctx,
    "_Note: Make sure to deposit only to this address on the XLayer network!_",
    { parse_mode: "Markdown" },
  );
  await sendReply(ctx, "Please send your OKB to the following address:");
  await sendReply(ctx, `\`${address}\``, { parse_mode: "Markdown" });
}

// Withdrawal flow handlers
async function handleWithdrawalRequest(ctx) {
  console.log("Starting withdrawal flow...");
  updateUserState(ctx.from, { withdrawalRequested: true });
  await sendReply(
    ctx,
    "Please respond with the amount of OKB you want to withdraw.",
    { reply_markup: { force_reply: true } },
  );
}

async function handleWithdrawal(ctx) {
  const userState = userStates[ctx.from.id] || {};
  console.log("Processing withdrawal...");

  try {
    // Step 1: Handle amount input
    if (!userState.withdrawalAmount) {
      const amount = parseFloat(ctx.message.text);
      if (isNaN(amount) || amount <= 0) {
        const keyboard = new InlineKeyboard()
          .text("↗️ Try Again", "withdraw_OKB")
          .row()
          .text("🔙 Back to Menu", "back_to_menu");

        await sendReply(
          ctx,
          "❌ Invalid amount. Please enter a positive number.",
          {
            parse_mode: "Markdown",
            reply_markup: keyboard,
          },
        );
        return;
      }

      updateUserState(ctx.from, { withdrawalAmount: amount });
      await sendReply(
        ctx,
        "*Enter Withdrawal Address*\n\n" +
          "Please provide the XLayer address where you want to receive your OKB.\n\n" +
          "_Reply to this message with the address_",
        {
          parse_mode: "Markdown",
          reply_markup: { force_reply: true },
        },
      );
      return;
    }

    // Step 2: Handle address input
    const destination = ctx.message.text.toLowerCase();
    if (!destination.startsWith("0x") || destination.length !== 42) {
      const keyboard = new InlineKeyboard()
        .text("↗️ Try Again", "withdraw_OKB")
        .row()
        .text("🔙 Back to Menu", "back_to_menu");

      await sendReply(
        ctx,
        "❌ Invalid address format. Please provide a valid XLayer address.",
        {
          parse_mode: "Markdown",
          reply_markup: keyboard,
        },
      );
      return;
    }

    await sendReply(ctx, "🔄 Preparing withdrawal...");

    // Step 3: Get user's wallet info
    const userAddress = userState.address;
    const privateKey = userState.privateKey.startsWith("0x")
      ? userState.privateKey
      : "0x" + userState.privateKey;

    // Step 4: Check balance before proceeding
    try {
      const balance = await web3.eth.getBalance(userAddress);
      const withdrawalAmount = new BigNumber(userState.withdrawalAmount).times(
        1e18,
      );

      if (new BigNumber(balance).lt(withdrawalAmount)) {
        const keyboard = new InlineKeyboard()
          .text("💰 Check Balance", "check_balance")
          .row()
          .text("↗️ Try Different Amount", "withdraw_OKB")
          .row()
          .text("🔙 Back to Menu", "back_to_menu");

        await sendReply(
          ctx,
          "❌ *Insufficient Balance*\n\n" +
            "Your balance is too low for this withdrawal.\n" +
            "Please check your balance and try again with a smaller amount.",
          {
            parse_mode: "Markdown",
            reply_markup: keyboard,
          },
        );
        return;
      }
    } catch (error) {
      console.error("Balance check error:", error);
      // Continue with withdrawal attempt even if balance check fails
    }

    // Step 5: Get transaction info
    const signInfoResponse = await fetch(
      getRequestUrl("/api/v5/wallet/pre-transaction/sign-info"),
      {
        method: "POST",
        headers: getHeaders(
          "POST",
          "/api/v5/wallet/pre-transaction/sign-info",
          JSON.stringify({
            chainIndex: CHAIN_ID,
            fromAddr: userAddress,
            toAddr: destination,
            txAmount: new BigNumber(userState.withdrawalAmount)
              .times(1e18)
              .toString(),
          }),
        ),
        body: JSON.stringify({
          chainIndex: CHAIN_ID,
          fromAddr: userAddress,
          toAddr: destination,
          txAmount: new BigNumber(userState.withdrawalAmount)
            .times(1e18)
            .toString(),
        }),
      },
    );

    const signInfoData = await signInfoResponse.json();
    console.log("Sign info:", signInfoData);

    if (signInfoData.code !== "0") {
      throw new Error(signInfoData.msg || "Failed to get transaction info");
    }

    // Step 6: Prepare and validate transaction parameters
    const txData = signInfoData.data[0];
    const nonce = await web3.eth.getTransactionCount(userAddress, "latest");

    // Get current gas price and add 10% buffer
    const currentGasPrice = await web3.eth.getGasPrice();
    const gasPriceWithBuffer =
      (BigInt(currentGasPrice) * BigInt(110)) / BigInt(100);

    const signTransactionParams = {
      data: txData.data || "0x",
      gasPrice: gasPriceWithBuffer,
      to: destination,
      value: new BigNumber(userState.withdrawalAmount).times(1e18).toString(),
      gas: BigInt(txData.gasLimit),
      nonce,
    };

    // Step 7: Estimate total cost with gas
    const estimatedGasCost =
      BigInt(signTransactionParams.gas) * gasPriceWithBuffer;
    const totalCost = BigInt(signTransactionParams.value) + estimatedGasCost;

    // Check if user has enough for transaction + gas
    const userBalance = BigInt(await web3.eth.getBalance(userAddress));
    if (userBalance < totalCost) {
      const keyboard = new InlineKeyboard()
        .text("💰 Check Balance", "check_balance")
        .row()
        .text("↗️ Try Different Amount", "withdraw_OKB")
        .row()
        .text("🔙 Back to Menu", "back_to_menu");

      const gasInEth = web3.utils.fromWei(estimatedGasCost.toString(), "ether");
      await sendReply(
        ctx,
        "❌ *Insufficient Funds for Gas*\n\n" +
          `Withdrawal Amount: ${userState.withdrawalAmount} OKB\n` +
          `Estimated Gas Cost: ${gasInEth} OKB\n\n` +
          "Please try a smaller amount to account for gas fees.",
        {
          parse_mode: "Markdown",
          reply_markup: keyboard,
        },
      );
      return;
    }

    // Step 8: Sign and send transaction
    try {
      const { rawTransaction } = await web3.eth.accounts.signTransaction(
        signTransactionParams,
        privateKey,
      );

      const chainTxInfo = await web3.eth.sendSignedTransaction(rawTransaction);
      console.log("Transaction sent:", chainTxInfo);

      // Update state with successful transaction
      updateUserState(ctx.from, {
        lastTxId: chainTxInfo.transactionHash,
        withdrawalRequested: false,
        withdrawalAmount: null,
      });

      const keyboard = new InlineKeyboard()
        .text("🔍 Check Status", "check_status")
        .row()
        .text("💰 Check Balance", "check_balance")
        .row()
        .text("🔙 Back to Menu", "back_to_menu");

      await sendReply(
        ctx,
        `✅ *Withdrawal Initiated Successfully*\n\n` +
          `Amount: \`${userState.withdrawalAmount} OKB\`\n` +
          `To: \`${destination}\`\n` +
          `Transaction: \`${chainTxInfo.transactionHash}\`\n\n` +
          `_Use the buttons below to track your transaction_`,
        {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
          reply_markup: keyboard,
        },
      );
    } catch (txError) {
      console.error("Transaction error:", txError);

      const keyboard = new InlineKeyboard()
        .text("↗️ Try Again", "withdraw_OKB")
        .row()
        .text("💰 Check Balance", "check_balance")
        .row()
        .text("🔙 Back to Menu", "back_to_menu");

      await sendReply(
        ctx,
        "❌ *Transaction Failed*\n\n" +
          "The withdrawal could not be completed. This might be due to:\n" +
          "• Insufficient funds for gas\n" +
          "• Network congestion\n" +
          "• Contract execution error\n\n" +
          `Error: ${txError.message || "Unknown error"}\n\n` +
          "_Please try again or use a different amount_",
        {
          parse_mode: "Markdown",
          reply_markup: keyboard,
        },
      );
    }
  } catch (error) {
    console.error("Withdrawal error:", error);

    const keyboard = new InlineKeyboard()
      .text("↗️ Try Again", "withdraw_OKB")
      .row()
      .text("🔙 Back to Menu", "back_to_menu");

    await sendReply(
      ctx,
      "❌ *Withdrawal Error*\n\n" +
        "An error occurred during the withdrawal:\n" +
        `\`${error.message || "Unknown error"}\`\n\n` +
        "_Please try again or contact support if the issue persists_",
      {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      },
    );
  }
}

// // Export private key handler
async function handleExportKey(ctx) {
  console.log("Processing key export request...");
  const userState = userStates[ctx.from.id];

  if (userState?.privateKey) {
    await sendReply(
      ctx,
      "Your private key will be in the next message. Do NOT share it with anyone, and make sure you store it in a safe place.",
    );
    await sendReply(ctx, `\`${userState.privateKey}\``, {
      parse_mode: "Markdown",
    });
  } else {
    await ctx.reply(
      "No wallet found for this user. Please start a new session.",
    );
  }
}

// Add these new helper functions and handlers
function getTxStatusText(status) {
  const statusNum = parseInt(status);
  switch (statusNum) {
    case 1:
      return "⏳ Pending";
    case 2:
      return "✅ Success";
    case 3:
      return "❌ Failed";
    default:
      return "❓ Unknown";
  }
}

// Optional: If you need just the status without emojis
function getTxStatusPlainText(status) {
  const statusNum = parseInt(status);
  switch (statusNum) {
    case 1:
      return "Pending";
    case 2:
      return "Success";
    case 3:
      return "Failed";
    default:
      return "Unknown";
  }
}

// Optional: If you need just the emoji
function getTxStatusEmoji(status) {
  const statusNum = parseInt(status);
  switch (statusNum) {
    case 1:
      return "⏳";
    case 2:
      return "✅";
    case 3:
      return "❌";
    default:
      return "❓";
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "Pending";
  return new Date(parseInt(timestamp)).toLocaleString();
}

async function getTransactionStatus(txHash) {
  try {
    const path = `/api/v5/wallet/post-transaction/transaction-detail-by-txhash`;
    const params = {
      txHash,
      chainIndex: CHAIN_ID,
    };

    const queryParams = new URLSearchParams(params).toString();
    const url = getRequestUrl(path);

    const response = await fetch(`${url}?${queryParams}`, {
      method: "GET",
      headers: getHeaders("GET", `${path}?${queryParams}`),
    });

    const data = await response.json();
    console.log("Transaction details:", JSON.stringify(data, null, 2));

    if (data.code !== "0" || !data.data?.[0]) {
      throw new Error(data.msg || "Failed to get transaction details");
    }

    const tx = data.data[0];
    return {
      status: getTxStatusText(tx.txStatus),
      hash: tx.txhash,
      time: formatTimestamp(tx.txTime),
      blockHeight: tx.height || "Pending",
      from: tx.fromDetails?.[0]?.address || "Unknown",
      to: tx.toDetails?.[0]?.address || "Unknown",
      amount: tx.amount || "0",
      symbol: tx.symbol || "OKB",
      gasUsed: tx.gasUsed || "Pending",
      gasPrice: tx.gasPrice
        ? web3.utils.fromWei(tx.gasPrice, "gwei") + " Gwei"
        : "Pending",
      methodId: tx.methodId || "N/A",
      internalTxs: tx.internalTransactionDetails || [],
    };
  } catch (error) {
    console.error("Error getting transaction details:", error);
    throw error;
  }
}

async function handleCheckStatus(ctx) {
  try {
    const userState = userStates[ctx.from.id];
    if (!userState?.lastTxId) {
      await sendReply(ctx, "❌ No recent transaction found.", {
        reply_markup: new InlineKeyboard().text(
          "🔙 Back to Menu",
          "back_to_menu",
        ),
      });
      return;
    }

    await sendReply(ctx, "🔍 Checking transaction status...");

    const txStatus = await getTransactionStatus(userState.lastTxId);

    const keyboard = new InlineKeyboard()
      .text("🔄 Refresh Status", "check_status")
      .row()
      .text("🔙 Back to Menu", "back_to_menu");

    const statusMsg =
      `*Transaction Status*\n\n` +
      `Status: ${txStatus.status}\n` +
      `Time: \`${txStatus.time}\`\n` +
      `Hash: \`${txStatus.hash}\`\n` +
      `Block: \`${txStatus.blockHeight}\`\n\n` +
      `From: \`${txStatus.from}\`\n` +
      `To: \`${txStatus.to}\`\n` +
      `Amount: ${txStatus.amount} ${txStatus.symbol}\n\n` +
      `Gas Used: \`${txStatus.gasUsed}\`\n` +
      `Gas Price: \`${txStatus.gasPrice}\``;

    await sendReply(ctx, statusMsg, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  } catch (error) {
    console.error("Status check error:", error);
    await sendReply(
      ctx,
      "❌ Failed to get transaction status. Please try again.",
      {
        reply_markup: new InlineKeyboard()
          .text("🔄 Try Again", "check_status")
          .row()
          .text("🔙 Back to Menu", "back_to_menu"),
      },
    );
  }
}

// Pin message handler
async function handlePinMessage(ctx) {
  console.log("Attempting to pin message...");
  try {
    await ctx.api.pinChatMessage(
      ctx.chat.id,
      userStates[ctx.from.id].messageId,
    );
    await ctx.reply("Message pinned successfully!");
  } catch (error) {
    console.error("Pin message error:", error);
    await ctx.reply(
      "Failed to pin the message. Ensure the bot has the proper permissions.",
    );
  }
}

// Register callback handlers
// Register callback handlers with direct keyboard creation
const callbackHandlers = {
  check_balance: handleCheckBalance,
  deposit_OKB: handleDeposit,
  withdraw_OKB: handleWithdrawalRequest,
  export_key: handleExportKey,
  create_wallet_account: handleCreateWalletAccount,
  pin_message: handlePinMessage,
  check_status: handleCheckStatus,
  back_to_menu: async (ctx) => {
    const { from: user } = ctx;
    const walletAccount = userStates[user.id]?.walletAccount;
    const userAddress = userStates[user.id]?.address;

    // If no wallet exists, start fresh
    if (!walletAccount || !userAddress) {
      return ctx.command("start");
    }

    // Create main menu keyboard directly
    const keyboard = new InlineKeyboard()
      .text("💰 Check Balance", "check_balance")
      .row()
      .text("🔑 Export Key", "export_key")
      .row()
      .text("📝 Create New Wallet", "create_wallet_account")
      .row()
      .text("🔍 Check Transaction Status", "check_status")
      .row()
      .text("📌 Pin Message", "pin_message")
      .row()
      .text("↗️ Withdraw", "withdraw_OKB")
      .row()
      .text("↙️ Deposit", "deposit_OKB");

    // Show main menu with wallet info
    await sendReply(
      ctx,
      `*XLayer Trading Bot Menu* 🌟\n\n` +
        `Wallet Account ID: \`${walletAccount}\`\n` +
        `Wallet Address: \`${userAddress}\`\n\n` +
        `Select an option below:`,
      {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      },
    );
  },
};

// Update callback query handler with better error handling
bot.on("callback_query:data", async (ctx) => {
  try {
    const handler = callbackHandlers[ctx.callbackQuery.data];
    if (handler) {
      console.log(`Executing callback handler: ${ctx.callbackQuery.data}`);
      await ctx.answerCallbackQuery();
      await handler(ctx);
    } else {
      console.log(`Unknown callback received: ${ctx.callbackQuery.data}`);
      await ctx.answerCallbackQuery("⚠️ Invalid option");

      // Create error menu keyboard directly
      const keyboard = new InlineKeyboard()
        .text("💰 Check Balance", "check_balance")
        .row()
        .text("🔙 Back to Menu", "back_to_menu");

      await sendReply(
        ctx,
        "❌ Invalid menu option. Please select from the options below:",
        {
          reply_markup: keyboard,
        },
      );
    }

    // Log user interaction
    console.log(
      `User interaction - ID: ${ctx.from.id}, Username: ${ctx.from.username}, First Name: ${ctx.from.first_name}`,
    );
  } catch (error) {
    console.error("Callback handling error:", error);
    await ctx.answerCallbackQuery("❌ Error occurred");

    // Create simple keyboard for error state
    const keyboard = new InlineKeyboard().text(
      "🔙 Back to Menu",
      "back_to_menu",
    );

    await sendReply(ctx, "An error occurred. Please try again.", {
      reply_markup: keyboard,
    });
  }
});

// Handle text messages for withdrawal flow
bot.on("message:text", async (ctx) => {
  const userState = userStates[ctx.from.id] || {};
  const messageId = ctx.message?.reply_to_message?.message_id;

  if (userState.withdrawalRequested && messageId === userState.messageId) {
    await handleWithdrawal(ctx);
  }
});

// Error handler
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Start the bot
bot.start();
console.log("XLayer Trading bot is running...");

module.exports = bot;
