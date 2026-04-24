import { estimateArbPnlTool, handleEstimateArbPnl } from "./estimateArbPnl.js";
import { getPairFundingTool, handleGetPairFunding } from "./getPairFunding.js";
import { handleScanFundingDiff, scanFundingDiffTool } from "./scanFundingDiff.js";

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export const tools: ToolDef[] = [scanFundingDiffTool, getPairFundingTool, estimateArbPnlTool];

export const toolHandlers: Record<string, ToolHandler> = {
  [scanFundingDiffTool.name]: handleScanFundingDiff,
  [getPairFundingTool.name]: handleGetPairFunding,
  [estimateArbPnlTool.name]: handleEstimateArbPnl,
};
