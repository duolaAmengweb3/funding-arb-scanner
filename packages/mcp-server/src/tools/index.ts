import {
  detectFundingAnomaliesTool,
  handleDetectFundingAnomalies,
} from "./detectFundingAnomalies.js";
import { estimateArbPnlTool, handleEstimateArbPnl } from "./estimateArbPnl.js";
import { estimateFullCostTool, handleEstimateFullCost } from "./estimateFullCost.js";
import { fundingScheduleTool, handleFundingSchedule } from "./fundingSchedule.js";
import { getPairFundingTool, handleGetPairFunding } from "./getPairFunding.js";
import {
  handleHistoricalSpreadContext,
  historicalSpreadContextTool,
} from "./historicalSpreadContext.js";
import { handleScanFundingDiff, scanFundingDiffTool } from "./scanFundingDiff.js";

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export const tools: ToolDef[] = [
  // Core judgment layer (new in v0.4)
  estimateFullCostTool,
  detectFundingAnomaliesTool,
  historicalSpreadContextTool,
  fundingScheduleTool,
  // Original data layer
  scanFundingDiffTool,
  getPairFundingTool,
  estimateArbPnlTool,
];

export const toolHandlers: Record<string, ToolHandler> = {
  [estimateFullCostTool.name]: handleEstimateFullCost,
  [detectFundingAnomaliesTool.name]: handleDetectFundingAnomalies,
  [historicalSpreadContextTool.name]: handleHistoricalSpreadContext,
  [fundingScheduleTool.name]: handleFundingSchedule,
  [scanFundingDiffTool.name]: handleScanFundingDiff,
  [getPairFundingTool.name]: handleGetPairFunding,
  [estimateArbPnlTool.name]: handleEstimateArbPnl,
};
