# Build with OKX OS Workshop

## In-Person Event (OKX OS Workshop)
**Date**: November 15th, 2024  
**Location**: OKXOS's Innovate Hub in BKK

## Workshop Content
1. **DEX Integration Basics**
   - API Overview
   - Authentication
   - Basic Calls

2. **Implementation Examples**
   - Price Checking
   - Trade Execution
   - Error Handling

3. **Sample Implementations**
   - Basic DEX Interface
   - Price Aggregation
   - Smart Routing

## Quick Start
```bash
# Clone the repository
git clone https://github.com/Julian-dev28/devcon-builders-challenge.git

# Change directory
cd devcon-builders-challenge
cd okx-dev-workshop

# Install dependencies for all projects
npm run install-all
```
set your `.env` variables

**evm-swap-app/.env**
```
REACT_APP_USER_ADDRESS=your_address_here
REACT_APP_PRIVATE_KEY=your_private_key_here
REACT_APP_API_KEY=your_api_key_here
REACT_APP_SECRET_KEY=your_secret_key_here
REACT_APP_API_PASSPHRASE=your_api_passphrase_here
```

**trading-bot/.env**
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OKX_PROJECT_ID=your_okx_project_id_here
OKX_API_KEY=your_okx_api_key_here
OKX_API_SECRET_KEY=your_okx_secret_key_here
OKX_API_PASSPHRASE=your_okx_passphrase_here
ENCRYPTION_KEY=your_encryption_key_here
```

```
# Start any demo
npm run start:widget    # For DEX Widget demo
npm run start:swap      # For EVM Swap demo
npm run start:bot       # For Trading Bot demo
```

## Base Templates
| Name | Description | Repl | GitHub | 
|------|-------------|------|--------|
| DEX Widget Demo | Ready-to-use widget implementation example | [Template](https://replit.com/@Juliandev28/dex-widget-demo) | [Repo](https://github.com/Julian-dev28/dex-widget-demo) 
| EVM Swap App | Working EVM swap functionality example | [Template](https://replit.com/@Juliandev28/okx-os-evm-swap-app) | [Repo](https://github.com/Julian-dev28/okx-os-evm-swap-app)  |
| Trading Bot | Basic Telegram trading bot setup | [Template](https://replit.com/@Juliandev28/OKX-OS-Trading-Bot) | [Repo](https://github.com/Julian-dev28/OKX-OS-Trading-Bot) | 

## Resources
| Resource | Description | Link |
|----------|-------------|------|
| DEX API Documentation | Complete guide for DEX API implementation | [Link](https://www.okx.com/web3/build/docs/waas/dex-api-quick-start) |
| Widget Integration Guide | Step-by-step widget integration tutorial | [Link](https://www.okx.com/web3/build/docs/waas/dex-widget-quick-start) |
| OKX Web3 Documentation | Comprehensive OKX Web3 development docs | [Link](https://www.okx.com/web3/build/docs) |

Need help? Join our [Discord community](https://discord.gg/PMJk9X6W) where our team is ready to support your building journey.
