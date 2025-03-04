import cryptoFactory from "./chain";
import cosmosConfig from "../config";
import { LiveConfig, ConfigSchema } from "@ledgerhq/live-config/LiveConfig";

describe("cryptoFactory test", () => {
  beforeAll(() => {
    LiveConfig.setConfig(cosmosConfig as ConfigSchema);
  });
  it("should not return null with currencies in cosmos family", () => {
    const currencies = [
      "cosmos",
      "osmosis",
      "osmo",
      "axelar",
      "binance_beacon_chain",
      "coreum",
      "desmos",
      "dydx",
      "nyx",
      "onomy",
      "sei_network",
      "persistence",
      "quicksilver",
      "secret_network",
      "sei_network",
      "stargaze",
      "stride",
    ];
    currencies.forEach(currency => {
      expect(cryptoFactory(currency)).not.toBeNull();
    });
  });

  it("should throw an error when currency id is unknown", () => {
    expect(() => cryptoFactory("unknown")).toThrow();
  });
});
