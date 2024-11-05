# OKX Developer Workshop
Build Multi-Chain DApps with OKX DEX & Wallet APIs

## Quick Start
```bash
# Clone the repository
git clone https://github.com/Julian-dev28/devcon-builders-challenge.git

# Change directory
cd okx-dev-workshop

# Install dependencies for all projects
npm run install-all

# Start any demo
npm run start:widget    # For DEX Widget demo
npm run start:swap      # For EVM Swap demo
npm run start:bot       # For Trading Bot demo
```

## Repository Structure
```
okx-dev-workshop/
├── dex-widget-demo/     # DEX Widget Integration
├── evm-swap-app/        # EVM Swap Implementation
├── trading-bot/         # Multi-chain Trading Bot
├── package.json         # Root package.json
└── README.md           # This file
```

## Prerequisites
- Node.js v16+
- npm v8+
- Git
- Replit account (for live coding)

## Projects Overview

### 1. DEX Widget Demo
Quick integration of OKX's DEX widget for token swaps.
- **Key Features**: Multi-chain support, customizable UI
- **Demo**: [Widget Demo on Replit](https://replit.com/@Juliandev28/dex-widget-demo)
- **Setup**: See [widget setup guide](./dex-widget-demo/README.md)

### 2. EVM Swap App
Direct integration with OKX's DEX API for token swaps.
- **Key Features**: Gas optimization, cross-chain support
- **Demo**: [Swap Demo on Replit](https://replit.com/@Juliandev28/okx-os-evm-swap-app)
- **Setup**: See [swap app guide](./evm-swap-app/README.md)

### 3. Trading Bot
Automated trading using OKX's APIs.
- **Key Features**: Multi-token support, strategy automation
- **Demo**: [Bot Demo on Replit](https://replit.com/@Juliandev28/OKX-OS-Trading-Bot)
- **Setup**: See [bot setup guide](./trading-bot/README.md)

## Workshop Challenge
Build a multi-chain trading platform using one or more templates:
1. Implement token swaps
2. Add automated trading features
3. Consider cross-chain interactions

## Documentation
- [OKX DEX API Docs](https://www.okx.com/docs-v5/en/)
- [Widget Integration Guide](https://www.okx.com/docs-v5/en/)
- [Trading API Reference](https://www.okx.com/docs-v5/en/)

## Support
- Discord: [Join our community](#)
- Issues: Use the GitHub issues tab
- Workshop Support: Ask mentors during the session

## License
MIT