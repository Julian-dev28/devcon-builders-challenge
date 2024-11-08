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

const native_token = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const usdc_address = "0x74b7f16337b8972027f6196a17a631ac6de26d22";
const demo_address = "0xa134df70a0f6581c0beb7176108d3649e8d37fe6";
const dmc_coin = "0x848e56ad13b728a668af89459851efd8a89c9f58";

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
