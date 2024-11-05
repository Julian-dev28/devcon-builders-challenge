import React, { useRef, useEffect } from "react";
import {
  createOkxSwapWidget,
  ProviderType,
  OkxSwapWidgetProps,
  OkxEvents,
  OkxEventHandler,
  IWidgetConfig,
  TradeType,
  THEME,
} from "@okxweb3/dex-widget";

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

const WidgetPage: React.FC = () => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!widgetRef.current) return;

    const params: OkxSwapWidgetProps["params"] = {
      appCode: "YOUR_APP_CODE",
      width: 450,
      height: 400,
      providerType: ProviderType.EVM,
      tradeType: TradeType.AUTO,
      chainIds: ["196", "8453"],
      theme: THEME.LIGHT,
      lang: "en_us",
      tokenPair: {
        fromChain: 196, //X Layer
        toChain: 196, // X Layer
        fromToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // OKB
        toToken: "0x74b7f16337b8972027f6196a17a631ac6de26d22", // USDC
      },
      bridgeTokenPar: {
        fromChain: 8453, // BASE
        toChain: 196, // X Layer
        fromToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // ETH
        toToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // OKB
      },
      feeConfig: {
        196: {
          feePercent: 1,
          referrerAddress: "0xd37268a16374d0a52c801c06a11ef32a35fcd2b9",
        },
        8453: {
          feePercent: 1,
          referrerAddress: "0xd37268a16374d0a52c801c06a11ef32a35fcd2b9",
        },
      },
    };
    const provider = window.ethereum;

    const listeners: IWidgetConfig["listeners"] = [
      {
        event: OkxEvents.ON_CONNECT_WALLET,
        handler: (() => {
          provider?.enable();
        }) as OkxEventHandler<OkxEvents.ON_CONNECT_WALLET>,
      },
    ];

    const widgetProps: IWidgetConfig = {
      params,
      provider,
      listeners,
    };

    const instance = createOkxSwapWidget(widgetRef.current, widgetProps);

    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <div className="widget-page">
      <h2>OKX DEX Widget</h2>
      <div ref={widgetRef} />
    </div>
  );
};

export default WidgetPage;
