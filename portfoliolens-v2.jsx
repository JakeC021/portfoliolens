import { useState, useMemo, useRef, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ScatterChart, Scatter } from "recharts";

/* ═══════════ FONTS ═══════════ */
const injectFonts = () => {
  if (document.getElementById("pfl-fonts")) return;
  const l = document.createElement("link"); l.id = "pfl-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";
  document.head.appendChild(l);
  const s = document.createElement("style");
  s.textContent = `*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px;height:5px}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}.fu{animation:fadeUp .38s ease both}.fu1{animation:fadeUp .38s .08s ease both}.fu2{animation:fadeUp .38s .16s ease both}.fu3{animation:fadeUp .38s .24s ease both}.slide{animation:slideIn .3s ease both}`;
  document.head.appendChild(s);
};

/* ═══════════ THEMES ═══════════ */
const DARK = {
  bg:"#0f1a2e", sur:"#172436", surB:"#1e304d", bdr:"#243a5c", bdrM:"#2e4a72",
  text:"#ddeaff", dim:"#7a9ac0", faint:"#3a5578",
  acc:"#4da6ff", accD:"rgba(77,166,255,0.13)",
  grn:"#1fc9a0", grnD:"rgba(31,201,160,0.1)",
  red:"#f06060", redD:"rgba(240,96,96,0.1)",
  amb:"#f5b740", ambD:"rgba(245,183,64,0.1)",
  vio:"#a07ef5", vioD:"rgba(160,126,245,0.13)",
  teal:"#38bdf8", tealD:"rgba(56,189,248,0.1)",
  shadow:"rgba(0,0,0,0.4)",
  mono:"'JetBrains Mono',monospace", body:"'Inter',sans-serif", disp:"'Syne',sans-serif"
};
const LIGHT = {
  bg:"#f0f4ff", sur:"#ffffff", surB:"#f5f7ff", bdr:"#d0dcf5", bdrM:"#b8caf0",
  text:"#1a2a4a", dim:"#5a7399", faint:"#a8bcd8",
  acc:"#2563eb", accD:"rgba(37,99,235,0.08)",
  grn:"#059669", grnD:"rgba(5,150,105,0.08)",
  red:"#dc2626", redD:"rgba(220,38,38,0.08)",
  amb:"#d97706", ambD:"rgba(217,119,6,0.08)",
  vio:"#7c3aed", vioD:"rgba(124,58,237,0.08)",
  teal:"#0891b2", tealD:"rgba(8,145,178,0.08)",
  shadow:"rgba(37,99,235,0.08)",
  mono:"'JetBrains Mono',monospace", body:"'Inter',sans-serif", disp:"'Syne',sans-serif"
};

/* ═══════════ I18N ═══════════ */
const STRINGS = {
  en: {
    appTagline:"CFA-GRADE PORTFOLIO INTELLIGENCE",
    homeH1a:"Understand your", homeH1b:"investments", homeH1c:"deeply.",
    homeSubtitle:"Research any asset with institutional-grade metrics, or build and analyse a full portfolio — total returns, Sharpe ratio, and max-Sharpe optimal weights.",
    researchTitle:"Research a Ticker", researchDesc:"Stocks, ETFs, crypto, commodities — search any asset for price history, financials, and CFA-level analysis.",
    buildTitle:"Build a Portfolio", buildDesc:"Add tickers — weights are distributed equally and you can optimize with AI once inside.",
    createBtn:(n)=>n>0?`Create portfolio with ${n} ticker${n>1?"s":""} →`:"Create new portfolio →",
    addTickerWarn:"⚠ Add at least one ticker before creating a portfolio.",
    yourPortfolios:"YOUR PORTFOLIOS", viewAll:"View all →",
    back:"← Back", switchTicker:"Switch ticker:", searchAnother:"Search another ticker...",
    addToPortfolio:"+ Add to Portfolio", deepAnalysis:"Deep Analysis", hideAnalysis:"Hide Analysis",
    marketCap:"Market Cap", peRatio:"P/E Ratio", pbRatio:"P/B Ratio",
    eps:"EPS", divYield:"Div. Yield", beta:"Beta", high52:"52W High", low52:"52W Low",
    revenue:"Revenue (TTM)", grossMargin:"Gross Margin", roic:"ROIC",
    totalReturn:"Total Return", priceOnly:"Price Only",
    reinvestDivs:"Reinvest Divs",
    priceAppreciation:"Price appreciation", reinvestStack:"Reinvested dividend income (stacked)",
    portfolioTotalReturn:"Portfolio Total Return", portfolioSubtitle:"Weighted blend — total return with reinvested dividends",
    holdings:"Holdings", weight:"Weight", price:"Price", return:"Return",
    maxSharpeWeights:"Max-Sharpe Weights", maxSharpeDesc:"Weights optimized to maximize return per unit of risk (Sharpe ratio).",
    current:"Current", optimal:"Optimal",
    healthScore:"Health Score", strong:"Strong 💪", moderate:"Moderate 📊", needsAttention:"Needs Attention ⚠",
    healthTooltip:"Score = Sharpe×12 + 50 − |Beta−1|×8 + diversification bonus.\nSharpe ratio (60%) · Beta neutrality (20%) · Diversification (20%).",
    sectorConcentration:"Sector Concentration",
    efficientFrontier:"Efficient Frontier",
    efDesc:"Each dot is a possible portfolio using your holdings with different weight combinations. The edge represents the best return for each level of risk.",
    yourPortfolio:"Your portfolio",
    maxSharpeLabel:"Maximize Sharpe", minVolLabel:"Minimize Volatility", maxRetLabel:"Maximize Return",
    maxSharpeDesc2:"Best return per unit of risk", minVolDesc:"Lowest portfolio variance", maxRetDesc:"Highest expected return",
    risk:"Risk", expected:"Expected",
    aiWelcome:"Ask me about your portfolio. Try: 'I want more income', 'reduce risk', or 'maximize Sharpe'.",
    aiEmptyPortfolio:"Add some tickers to your portfolio first.",
    aiNotInPortfolio:(sym)=>`I can only analyze assets that are already in your portfolio. "${sym}" is not currently held. Please add it to your portfolio first using the "+ Add Ticker" button.`,
    aiUnknown:"I can help optimize for: income (dividends), Sharpe ratio, growth (returns), or risk reduction. What matters most?",
    aiApplied:"Done! Portfolio weights updated.",
    aiLabel:{income:"maximize dividend income",sharpe:"maximize risk-adjusted return (Sharpe)",growth:"maximize total return",risk:"minimize portfolio volatility"},
    apply:"Apply", discard:"Discard",
    askPortfolio:"Ask about your portfolio...",
    portfolioAI:"Portfolio AI",
    feedbackBtn:"Feedback on your experience",
    feedbackTitle:"Feedback on your experience",
    feedbackQ1:"Does this website help you understand your portfolio more deeply?",
    feedbackQ2:"Does this website help your investment decisions?",
    feedbackNotAtAll:"Not at all", feedbackLotsHelp:"Helps me a lot",
    feedbackComment:"Additional comments (optional)",
    feedbackCommentPlaceholder:"Share any thoughts, suggestions, or feature requests...",
    feedbackGender:"Gender", genderM:"Male", genderF:"Female", genderNB:"Non-binary", genderNA:"Prefer not to say",
    feedbackAge:"Age range", ageLt20:"Under 20", age2029:"20–29", age3039:"30–39", age4059:"40–59", age60:"60 and above",
    submitFeedback:"Submit Feedback",
    thankYou:"Thank you for your feedback!", thankYouSub:"Your input helps improve PortfolioLens.",
    execSummary:"📋 Executive Summary", collapse:"▲ Collapse", expand:"▼ Expand",
    strengths:"✓ Strengths", riskFactors:"⚠ Risk Factors",
    deepAnalysisTitle:"Deep Analysis",
    ratiosTab:"📊 Ratios", valuationTab:"💹 Valuation", qualityTab:"🔬 Quality", revenueTab:"📈 Financials", dupontTab:"⚙ DuPont",
    leverageDebt:"Leverage & Debt", liquidityReturns:"Liquidity & Returns",
    debtEquity:"Debt / Equity", debtRatio:"Debt Ratio", interestCoverage:"Interest Coverage",
    netDebtEbitda:"Net Debt/EBITDA", currentRatio:"Current Ratio", quickRatio:"Quick Ratio",
    roe:"Return on Equity",
    multiples:"Multiples", intrinsicValue:"Intrinsic Value",
    dcfFairValue:"DCF Fair Value", ddmLabel:"DDM (Dividend Discount)", undervalued:"Undervalued", overvalued:"Overvalued",
    historicalPE:"Historical P/E",
    earningsQuality:"Earnings Quality", fcfYield:"FCF Yield", fcfConversion:"FCF Conversion", accrualsRatio:"Accruals Ratio",
    roicTrend:"ROIC Trend (5Y)", roicMoat:"ROIC > 15% typically signals a competitive moat",
    financialTrend:"5-Year Financial Trend", yoyGrowth:"YoY Growth",
    dupontTitle:"DuPont ROE Decomposition", netMargin:"Net Margin", assetTurnover:"Asset Turnover", leverage:"Leverage",
    dupontExplain:"ROE = Net Margin × Asset Turnover × Financial Leverage. High ROE from margins = quality. High ROE from leverage = scrutiny.",
    addToPort:"Add {sym} to Portfolio", equalWeights:"Weights distributed equally.",
    existingPort:"Existing Portfolio", newPort:"New Portfolio",
    portName:"Portfolio Name", portNamePlaceholder:"e.g. Growth Portfolio",
    cancel:"Cancel", confirm:"Confirm",
    simData:"Simulated demo data",
    computing:"Computing CFA-grade metrics...",
    portfolioOf:(n)=>`${n} holdings · Max-Sharpe optimal weights available`,
    addTicker:"+ Add Ticker",
    searchToAdd:"Search to add to this portfolio...",
    addPreviewTitle:(sym)=>`Add ${sym} — New Weight Distribution`,
    confirmAdd:"Confirm Add",
    yourPortfoliosTitle:"Your Portfolios",
    portfolioAIWelcome:"Portfolio AI",
    priceAppreciationLabel:"Price Appreciation",
    dividendIncome:"Dividend Income",
    sharpeRatio:"Sharpe Ratio",
    portfolioBeta:"Portfolio Beta",
    ofInitial:"of initial",
    ticker:"Ticker",
    reason:"Reason",
    newWeight:"New",
    nHoldings:(n)=>`${n} holdings`,
    noHoldings:"No holdings.",
    searchToAddPrompt:"Search for a ticker to add.",
    loading:(sym)=>`Loading ${sym}...`,
    efHighlighted:"is highlighted.",
    healthCalcTitle:"How Health Score is Calculated",
    healthSharpe:"Sharpe Ratio",
    healthBeta:"Beta Neutrality",
    healthDiversification:"Diversification",
    healthYourScore:(score,sharpe,beta)=>`Your score: ${score}/100 · Sharpe=${sharpe} · β=${beta}`,
    revenueLabel:"Revenue",
    grossProfitLabel:"Gross Profit",
    netIncomeLabel:"Net Income",
    aiAdjusted:(label)=>`Adjusted weights to ${label}. Review below.`,
    dataAsOfLabel:(date)=>`${date} · Live data via web search`,
    fetchingData:"Fetching live market data...",
    fetchError:"Failed to fetch data, using simulated data",
    realData:"Live data via web search",
    editName:"Click to edit portfolio name",
  },
  zh: {
    appTagline:"机构级投资组合分析平台",
    homeH1a:"深度理解您的", homeH1b:"投资", homeH1c:"",
    homeSubtitle:"研究任意资产的机构级指标，或构建并分析完整投资组合——总回报、夏普比率和最优权重配置。",
    researchTitle:"研究标的", researchDesc:"股票、ETF、加密货币、大宗商品——搜索任意资产，获取价格历史、财务数据和CFA级分析。",
    buildTitle:"构建投资组合", buildDesc:"添加标的——权重平均分配，进入后可用AI进行优化。",
    createBtn:(n)=>n>0?`创建含${n}个标的的组合 →`:"新建投资组合 →",
    addTickerWarn:"⚠ 请先添加至少一个标的，再创建组合。",
    yourPortfolios:"您的组合", viewAll:"查看全部 →",
    back:"← 返回", switchTicker:"切换标的：", searchAnother:"搜索其他标的...",
    addToPortfolio:"+ 加入组合", deepAnalysis:"深度分析", hideAnalysis:"收起分析",
    marketCap:"市值", peRatio:"市盈率", pbRatio:"市净率",
    eps:"每股收益", divYield:"股息率", beta:"贝塔", high52:"52周高", low52:"52周低",
    revenue:"营业收入(TTM)", grossMargin:"毛利率", roic:"投入资本回报率",
    totalReturn:"总回报", priceOnly:"仅价格",
    reinvestDivs:"股息再投资",
    priceAppreciation:"价格涨幅", reinvestStack:"再投资股息收益（堆叠）",
    portfolioTotalReturn:"组合总回报", portfolioSubtitle:"各标的加权合并——再投资策略下的收益表现",
    holdings:"持仓明细", weight:"权重", price:"价格", return:"回报",
    maxSharpeWeights:"最大夏普权重", maxSharpeDesc:"以最大化风险调整后回报（夏普比率）为目标优化权重。",
    current:"当前", optimal:"最优",
    healthScore:"健康评分", strong:"优秀 💪", moderate:"中等 📊", needsAttention:"需关注 ⚠",
    healthTooltip:"评分 = 夏普×12 + 50 − |贝塔−1|×8 + 分散化加分。\n夏普比率(60%) · 贝塔中性(20%) · 分散化(20%)。",
    sectorConcentration:"行业集中度",
    efficientFrontier:"有效前沿",
    efDesc:"每个点代表用您持仓以不同权重构成的可能组合。曲线边缘代表每级风险下的最优回报。",
    yourPortfolio:"您的组合",
    maxSharpeLabel:"最大夏普", minVolLabel:"最小波动", maxRetLabel:"最大回报",
    maxSharpeDesc2:"每单位风险的最优回报", minVolDesc:"最低组合方差", maxRetDesc:"最高预期回报",
    risk:"风险", expected:"预期",
    aiWelcome:"请问我有关您组合的任何问题，例如：'我想要更多收益'、'降低风险'或'最大化夏普比率'。",
    aiEmptyPortfolio:"请先向组合添加一些标的。",
    aiNotInPortfolio:(sym)=>`AI助手只能分析组合内已有的资产。"${sym}"目前不在您的组合中，请先通过"+ 添加标的"按钮将其加入组合。`,
    aiUnknown:"我可以为以下目标优化：收益（股息）、夏普比率、增长（回报）或降低风险。您最关注哪项？",
    aiApplied:"完成！组合权重已更新。",
    aiAdjusted:(label)=>`已调整权重以${label}。请查看以下方案。`,
    aiLabel:{income:"最大化股息收益",sharpe:"最大化风险调整回报（夏普）",growth:"最大化总回报",risk:"最小化组合波动"},
    apply:"应用", discard:"放弃",
    askPortfolio:"询问关于您组合的问题...",
    portfolioAI:"组合AI",
    feedbackBtn:"分享您的体验",
    feedbackTitle:"分享您的体验",
    feedbackQ1:"本网站是否帮助您更深入地了解了您的投资组合？",
    feedbackQ2:"本网站是否对您的投资决策有所帮助？",
    feedbackNotAtAll:"完全没有", feedbackLotsHelp:"非常有帮助",
    feedbackComment:"补充意见（选填）",
    feedbackCommentPlaceholder:"欢迎分享任何想法、建议或功能需求...",
    feedbackGender:"性别", genderM:"男", genderF:"女", genderNB:"非二元性别", genderNA:"不愿透露",
    feedbackAge:"年龄段", ageLt20:"20岁以下", age2029:"20–29岁", age3039:"30–39岁", age4059:"40–59岁", age60:"60岁及以上",
    submitFeedback:"提交反馈",
    thankYou:"感谢您的反馈！", thankYouSub:"您的意见有助于改进 PortfolioLens。",
    execSummary:"📋 执行摘要", collapse:"▲ 收起", expand:"▼ 展开",
    strengths:"✓ 优势", riskFactors:"⚠ 风险因素",
    deepAnalysisTitle:"深度分析",
    ratiosTab:"📊 比率", valuationTab:"💹 估值", qualityTab:"🔬 质量", revenueTab:"📈 财务", dupontTab:"⚙ 杜邦",
    leverageDebt:"杠杆与负债", liquidityReturns:"流动性与回报",
    debtEquity:"债务/权益", debtRatio:"资产负债率", interestCoverage:"利息覆盖倍数",
    netDebtEbitda:"净债务/EBITDA", currentRatio:"流动比率", quickRatio:"速动比率",
    roe:"净资产收益率",
    multiples:"估值倍数", intrinsicValue:"内在价值",
    dcfFairValue:"DCF公允价值", ddmLabel:"股利贴现模型", undervalued:"低估", overvalued:"高估",
    historicalPE:"历史市盈率",
    earningsQuality:"盈利质量", fcfYield:"自由现金流收益率", fcfConversion:"自由现金流转换率", accrualsRatio:"应计比率",
    roicTrend:"ROIC趋势（5年）", roicMoat:"ROIC>15%通常表明存在竞争护城河",
    financialTrend:"五年财务趋势", yoyGrowth:"同比增长",
    revenueLabel:"营业收入", grossProfitLabel:"毛利润", netIncomeLabel:"净利润",
    dupontTitle:"杜邦ROE分解", netMargin:"净利润率", assetTurnover:"资产周转率", leverage:"财务杠杆",
    dupontExplain:"ROE = 净利润率 × 资产周转率 × 财务杠杆。ROE高且主要来自利润率=优质；主要来自杠杆=需谨慎。",
    addToPort:"将{sym}加入组合", equalWeights:"权重平均分配。",
    existingPort:"已有组合", newPort:"新建组合",
    portName:"组合名称", portNamePlaceholder:"例：成长型组合",
    cancel:"取消", confirm:"确认",
    simData:"模拟演示数据",
    computing:"正在计算CFA级指标...",
    portfolioOf:(n)=>`${n}个标的 · 可用最大夏普权重优化`,
    addTicker:"+ 添加标的",
    searchToAdd:"搜索以添加到组合...",
    addPreviewTitle:(sym)=>`添加 ${sym} — 新权重分配`,
    confirmAdd:"确认添加",
    yourPortfoliosTitle:"您的投资组合",
    portfolioAIWelcome:"组合AI",
    priceAppreciationLabel:"价格增值",
    dividendIncome:"股息收入",
    sharpeRatio:"夏普比率",
    portfolioBeta:"组合贝塔",
    ofInitial:"占初始投资",
    ticker:"标的",
    reason:"原因",
    newWeight:"新权重",
    nHoldings:(n)=>`${n}个持仓`,
    noHoldings:"暂无持仓。",
    searchToAddPrompt:"搜索标的以添加到组合。",
    loading:(sym)=>`正在加载 ${sym}...`,
    efHighlighted:"以高亮显示。",
    healthCalcTitle:"健康评分计算方法",
    healthSharpe:"夏普比率",
    healthBeta:"贝塔中性",
    healthDiversification:"分散化",
    healthYourScore:(score,sharpe,beta)=>`您的评分: ${score}/100 · 夏普=${sharpe} · β=${beta}`,
    dataAsOfLabel:(date)=>`${date} · 联网实时数据`,
    fetchingData:"正在获取实时行情数据...",
    fetchError:"获取数据失败，使用模拟数据",
    realData:"联网实时数据",
    editName:"点击修改组合名称",
  }
};

/* ═══════════ TICKER LIST ═══════════ */
const TICKER_LIST = [
  {symbol:"AAPL",name:"Apple Inc.",sector:"Technology",type:"stock",basePrice:225,beta:1.2},
  {symbol:"MSFT",name:"Microsoft Corporation",sector:"Technology",type:"stock",basePrice:415,beta:0.9},
  {symbol:"NVDA",name:"NVIDIA Corporation",sector:"Technology",type:"stock",basePrice:850,beta:1.7},
  {symbol:"GOOGL",name:"Alphabet Inc.",sector:"Comm. Services",type:"stock",basePrice:195,beta:1.1},
  {symbol:"AMZN",name:"Amazon.com Inc.",sector:"Consumer Disc.",type:"stock",basePrice:235,beta:1.3},
  {symbol:"META",name:"Meta Platforms Inc.",sector:"Comm. Services",type:"stock",basePrice:610,beta:1.4},
  {symbol:"TSLA",name:"Tesla Inc.",sector:"Consumer Disc.",type:"stock",basePrice:280,beta:2.1},
  {symbol:"AVGO",name:"Broadcom Inc.",sector:"Technology",type:"stock",basePrice:1700,beta:1.2},
  {symbol:"JPM",name:"JPMorgan Chase",sector:"Financials",type:"stock",basePrice:250,beta:1.1},
  {symbol:"V",name:"Visa Inc.",sector:"Financials",type:"stock",basePrice:320,beta:0.9},
  {symbol:"MA",name:"Mastercard Inc.",sector:"Financials",type:"stock",basePrice:530,beta:1.0},
  {symbol:"UNH",name:"UnitedHealth Group",sector:"Healthcare",type:"stock",basePrice:570,beta:0.6},
  {symbol:"JNJ",name:"Johnson & Johnson",sector:"Healthcare",type:"stock",basePrice:155,beta:0.5},
  {symbol:"LLY",name:"Eli Lilly",sector:"Healthcare",type:"stock",basePrice:820,beta:0.7},
  {symbol:"ABBV",name:"AbbVie Inc.",sector:"Healthcare",type:"stock",basePrice:190,beta:0.8},
  {symbol:"MRK",name:"Merck & Co.",sector:"Healthcare",type:"stock",basePrice:130,beta:0.7},
  {symbol:"PFE",name:"Pfizer Inc.",sector:"Healthcare",type:"stock",basePrice:28,beta:0.6},
  {symbol:"PG",name:"Procter & Gamble",sector:"Consumer Staples",type:"stock",basePrice:170,beta:0.5},
  {symbol:"KO",name:"Coca-Cola Co.",sector:"Consumer Staples",type:"stock",basePrice:65,beta:0.5},
  {symbol:"PEP",name:"PepsiCo Inc.",sector:"Consumer Staples",type:"stock",basePrice:155,beta:0.5},
  {symbol:"WMT",name:"Walmart Inc.",sector:"Consumer Staples",type:"stock",basePrice:105,beta:0.5},
  {symbol:"COST",name:"Costco Wholesale",sector:"Consumer Staples",type:"stock",basePrice:990,beta:0.8},
  {symbol:"XOM",name:"Exxon Mobil",sector:"Energy",type:"stock",basePrice:115,beta:0.9},
  {symbol:"CVX",name:"Chevron Corp.",sector:"Energy",type:"stock",basePrice:155,beta:0.9},
  {symbol:"BAC",name:"Bank of America",sector:"Financials",type:"stock",basePrice:45,beta:1.3},
  {symbol:"WFC",name:"Wells Fargo",sector:"Financials",type:"stock",basePrice:75,beta:1.2},
  {symbol:"GS",name:"Goldman Sachs",sector:"Financials",type:"stock",basePrice:590,beta:1.4},
  {symbol:"HD",name:"Home Depot Inc.",sector:"Consumer Disc.",type:"stock",basePrice:420,beta:1.0},
  {symbol:"MCD",name:"McDonald's Corp.",sector:"Consumer Disc.",type:"stock",basePrice:295,beta:0.7},
  {symbol:"NKE",name:"Nike Inc.",sector:"Consumer Disc.",type:"stock",basePrice:75,beta:1.1},
  {symbol:"DIS",name:"Walt Disney Co.",sector:"Comm. Services",type:"stock",basePrice:115,beta:1.2},
  {symbol:"NFLX",name:"Netflix Inc.",sector:"Comm. Services",type:"stock",basePrice:1050,beta:1.4},
  {symbol:"AMD",name:"Advanced Micro Devices",sector:"Technology",type:"stock",basePrice:115,beta:1.8},
  {symbol:"INTC",name:"Intel Corporation",sector:"Technology",type:"stock",basePrice:24,beta:1.0},
  {symbol:"QCOM",name:"Qualcomm Inc.",sector:"Technology",type:"stock",basePrice:165,beta:1.3},
  {symbol:"CRM",name:"Salesforce Inc.",sector:"Technology",type:"stock",basePrice:315,beta:1.4},
  {symbol:"ORCL",name:"Oracle Corporation",sector:"Technology",type:"stock",basePrice:190,beta:1.0},
  {symbol:"ADBE",name:"Adobe Inc.",sector:"Technology",type:"stock",basePrice:440,beta:1.3},
  {symbol:"NOW",name:"ServiceNow Inc.",sector:"Technology",type:"stock",basePrice:1100,beta:1.3},
  {symbol:"UBER",name:"Uber Technologies",sector:"Consumer Disc.",type:"stock",basePrice:82,beta:1.6},
  {symbol:"PYPL",name:"PayPal Holdings",sector:"Financials",type:"stock",basePrice:75,beta:1.5},
  {symbol:"COIN",name:"Coinbase Global",sector:"Financials",type:"stock",basePrice:245,beta:2.5},
  {symbol:"PLTR",name:"Palantir Technologies",sector:"Technology",type:"stock",basePrice:88,beta:2.0},
  {symbol:"SHOP",name:"Shopify Inc.",sector:"Technology",type:"stock",basePrice:115,beta:1.8},
  {symbol:"TSM",name:"Taiwan Semiconductor",sector:"Technology",type:"stock",basePrice:210,beta:1.1},
  {symbol:"ASML",name:"ASML Holding",sector:"Technology",type:"stock",basePrice:740,beta:1.1},
  {symbol:"BABA",name:"Alibaba Group",sector:"Consumer Disc.",type:"stock",basePrice:110,beta:1.5},
  {symbol:"TM",name:"Toyota Motor",sector:"Consumer Disc.",type:"stock",basePrice:215,beta:0.7},
  {symbol:"SONY",name:"Sony Group",sector:"Comm. Services",type:"stock",basePrice:110,beta:0.9},
  // ETFs
  {symbol:"SPY",name:"SPDR S&P 500 ETF",sector:"ETF – Broad",type:"etf",basePrice:590,beta:1.0},
  {symbol:"VOO",name:"Vanguard S&P 500 ETF",sector:"ETF – Broad",type:"etf",basePrice:545,beta:1.0},
  {symbol:"QQQ",name:"Invesco QQQ Trust",sector:"ETF – Broad",type:"etf",basePrice:495,beta:1.1},
  {symbol:"VTI",name:"Vanguard Total Mkt ETF",sector:"ETF – Broad",type:"etf",basePrice:285,beta:1.0},
  {symbol:"IWM",name:"iShares Russell 2000",sector:"ETF – Broad",type:"etf",basePrice:230,beta:1.2},
  {symbol:"VEA",name:"Vanguard Dev Markets",sector:"ETF – Intl",type:"etf",basePrice:54,beta:0.9},
  {symbol:"EEM",name:"iShares EM ETF",sector:"ETF – Intl",type:"etf",basePrice:43,beta:1.1},
  {symbol:"GLD",name:"SPDR Gold Shares",sector:"ETF – Commodity",type:"etf",basePrice:273,beta:0.1},
  {symbol:"TLT",name:"iShares 20yr Treasury",sector:"ETF – Bond",type:"etf",basePrice:88,beta:-0.2},
  {symbol:"AGG",name:"iShares Core US Bond",sector:"ETF – Bond",type:"etf",basePrice:96,beta:0.0},
  {symbol:"HYG",name:"iShares High Yield Bond",sector:"ETF – Bond",type:"etf",basePrice:77,beta:0.4},
  {symbol:"XLK",name:"Technology Select SPDR",sector:"ETF – Sector",type:"etf",basePrice:235,beta:1.2},
  {symbol:"XLF",name:"Financial Select SPDR",sector:"ETF – Sector",type:"etf",basePrice:47,beta:1.1},
  {symbol:"XLE",name:"Energy Select SPDR",sector:"ETF – Sector",type:"etf",basePrice:92,beta:1.0},
  {symbol:"XLV",name:"Health Care Select SPDR",sector:"ETF – Sector",type:"etf",basePrice:148,beta:0.6},
  {symbol:"ARKK",name:"ARK Innovation ETF",sector:"ETF – Theme",type:"etf",basePrice:55,beta:1.8},
  {symbol:"TQQQ",name:"ProShares UltraPro QQQ",sector:"ETF – Leveraged",type:"etf",basePrice:65,beta:3.0},
  {symbol:"VNQ",name:"Vanguard Real Estate ETF",sector:"ETF – REIT",type:"etf",basePrice:87,beta:0.8},
  {symbol:"IBIT",name:"iShares Bitcoin Trust",sector:"ETF – Crypto",type:"etf",basePrice:55,beta:2.2},
  // Mutual Funds
  {symbol:"FXAIX",name:"Fidelity 500 Index",sector:"Mutual Fund",type:"fund",basePrice:208,beta:1.0},
  {symbol:"VTSAX",name:"Vanguard Total Stock Mkt",sector:"Mutual Fund",type:"fund",basePrice:138,beta:1.0},
  {symbol:"VFIAX",name:"Vanguard 500 Index Admiral",sector:"Mutual Fund",type:"fund",basePrice:530,beta:1.0},
  {symbol:"FZROX",name:"Fidelity ZERO Total Market",sector:"Mutual Fund",type:"fund",basePrice:19,beta:1.0},
  {symbol:"DODGX",name:"Dodge & Cox Stock Fund",sector:"Mutual Fund",type:"fund",basePrice:285,beta:0.9},
  {symbol:"FCNTX",name:"Fidelity Contrafund",sector:"Mutual Fund",type:"fund",basePrice:22,beta:1.0},
  // Crypto
  {symbol:"BTC",name:"Bitcoin",sector:"Crypto",type:"crypto",basePrice:90000,beta:1.5},
  {symbol:"ETH",name:"Ethereum",sector:"Crypto",type:"crypto",basePrice:3200,beta:1.6},
  {symbol:"BNB",name:"BNB",sector:"Crypto",type:"crypto",basePrice:620,beta:1.4},
  {symbol:"SOL",name:"Solana",sector:"Crypto",type:"crypto",basePrice:180,beta:1.8},
  {symbol:"XRP",name:"XRP",sector:"Crypto",type:"crypto",basePrice:2.8,beta:1.7},
  {symbol:"ADA",name:"Cardano",sector:"Crypto",type:"crypto",basePrice:0.85,beta:1.8},
  {symbol:"AVAX",name:"Avalanche",sector:"Crypto",type:"crypto",basePrice:38,beta:1.9},
  {symbol:"DOGE",name:"Dogecoin",sector:"Crypto",type:"crypto",basePrice:0.38,beta:2.2},
  {symbol:"LINK",name:"Chainlink",sector:"Crypto",type:"crypto",basePrice:18,beta:1.8},
  // Commodities
  {symbol:"GC=F",name:"Gold Futures",sector:"Commodity",type:"commodity",basePrice:2950,beta:0.1},
  {symbol:"SI=F",name:"Silver Futures",sector:"Commodity",type:"commodity",basePrice:32,beta:0.3},
  {symbol:"CL=F",name:"WTI Crude Oil",sector:"Commodity",type:"commodity",basePrice:72,beta:0.7},
  {symbol:"NG=F",name:"Natural Gas",sector:"Commodity",type:"commodity",basePrice:2.9,beta:0.5},
  {symbol:"ZW=F",name:"Wheat Futures",sector:"Commodity",type:"commodity",basePrice:540,beta:0.3},
  {symbol:"HG=F",name:"Copper Futures",sector:"Commodity",type:"commodity",basePrice:4.5,beta:0.6},
];

/* ═══════════ REAL DATA FETCHER ═══════════ */
/* ═══════════ YAHOO FINANCE DATA VIA ANTHROPIC WEB SEARCH ═══════════ */
/* ═══════════ YAHOO FINANCE DATA VIA REST API ═══════════ */
async function fetchYahooData(symbol, onStatus) {
  onStatus?.(`Fetching ${symbol} from Yahoo Finance...`);
  try {
    // We use a public CORS proxy because Yahoo Finance blocks direct browser requests
    const targetUrl = encodeURIComponent(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`);
    const response = await fetch(`https://api.allorigins.win/raw?url=${targetUrl}`);

    if (!response.ok) {
      onStatus?.(`API error ${response.status} for ${symbol}`);
      return null;
    }

    const data = await response.json();
    const quote = data?.quoteResponse?.result?.[0];

    if (!quote) {
      onStatus?.(`✗ No data found for ${symbol}`);
      return null;
    }

    const price = quote.regularMarketPrice || 0;

    if (price > 0) {
      onStatus?.(`✓ ${symbol}: $${price.toFixed(2)}`);

      // Helper to format market cap into T, B, M strings
      const formatMarketCap = (num) => {
        if (!num) return "";
        if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
        if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
        if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
        return num.toString();
      };

      return {
        meta: {
          symbol: quote.symbol || symbol,
          price: price,
          prevClose: quote.regularMarketPreviousClose || 0,
          high52: quote.fiftyTwoWeekHigh || 0,
          low52: quote.fiftyTwoWeekLow || 0,
          marketCap: formatMarketCap(quote.marketCap),
          pe: quote.trailingPE || 0,
          eps: quote.epsTrailingTwelveMonths || 0,
          // Yahoo returns dividend yield as a decimal (e.g., 0.025 for 2.5%)
          divYield: quote.trailingAnnualDividendYield ? +(quote.trailingAnnualDividendYield * 100).toFixed(2) : 0,
          beta: quote.beta || 0,
        },
        history: null,
      };
    }

    onStatus?.(`✗ Invalid price data for ${symbol}`);
  } catch (e) {
    onStatus?.(`✗ Error fetching ${symbol}: ${e.message}`);
    console.error(`[${symbol}] Error:`, e);
  }
  return null;
}

async function fetchRealStockData(symbols,onStatus){
  const map={};
  for(const s of symbols){
    const result=await fetchYahooData(s,onStatus);
    if(result)map[s]=result;
  }
  return map;
}

/* ═══════════ DATA HELPERS ═══════════ */
function seededRng(seed){let s=Math.abs(Math.round(seed))||1;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};}

function getLastTradingDay(){
  const d=new Date();
  const day=d.getDay();
  if(day===0)d.setDate(d.getDate()-2);
  else if(day===6)d.setDate(d.getDate()-1);
  d.setHours(16,0,0,0);
  return d;
}
function isTradingDay(d){const day=d.getDay();return day!==0&&day!==6;}
function prevTradingDay(d){const r=new Date(d);r.setDate(r.getDate()-1);while(!isTradingDay(r))r.setDate(r.getDate()-1);return r;}

let _cachedTradingDays=null;
function genTradingDays(count){
  if(_cachedTradingDays&&_cachedTradingDays.length===count)return _cachedTradingDays;
  const days=[];
  let d=getLastTradingDay();
  for(let i=0;i<count;i++){days.unshift(new Date(d));d=prevTradingDay(d);}
  _cachedTradingDays=days;
  return days;
}

function fmtDate(d){
  const yr=d.getFullYear();
  const mo=String(d.getMonth()+1).padStart(2,"0");
  const da=String(d.getDate()).padStart(2,"0");
  return `${yr}-${mo}-${da}`;
}

function genHistory(symbol,basePrice,type="stock",realPrice){
  const rng=seededRng(symbol.split("").reduce((a,c)=>a+c.charCodeAt(0)*31,7));
  const endPrice=realPrice||basePrice;
  const totalDays=2520; // ~10 years of trading days
  const tradingDays=genTradingDays(totalDays);
  const dailyVol=type==="crypto"?0.035:type==="commodity"?0.012:0.015;

  // Random walk
  const raw=[];let p=1.0;
  for(let i=0;i<totalDays;i++){p=Math.max(p+(rng()-0.485)*dailyVol*p,0.01);raw.push(p);}

  // Anchor endpoints
  const startPrice=endPrice*0.42;
  const rawStart=raw[0],rawEnd=raw[totalDays-1];

  const data=[];let cumDiv=0;
  for(let i=0;i<totalDays;i++){
    const t=i/(totalDays-1);
    const target=startPrice+(endPrice-startPrice)*t;
    const rawExp=rawStart+(rawEnd-rawStart)*t;
    const dev=rawExp>0?(raw[i]-rawExp)/rawExp:0;
    const price=+Math.max(0.01,target*(1+dev*0.5)).toFixed(2);
    const div=(type==="stock"||type==="etf")&&rng()>0.96?price*0.003:0;
    cumDiv+=div;
    data.push({date:fmtDate(tradingDays[i]),dateObj:tradingDays[i],price,dividend:+div.toFixed(4),cumDiv:+cumDiv.toFixed(2),total:+(price+cumDiv).toFixed(2),divPortion:+cumDiv.toFixed(2)});
  }
  return data;
}

function buildStockInfo(ticker,yahooData){
  const rng=seededRng(ticker.symbol.charCodeAt(0)*77+13);
  const type=ticker.type||"stock";
  const yd=yahooData||null; // {meta, history} from Yahoo
  const meta=yd?.meta||null;
  const currentPrice=meta?.price||ticker.basePrice;

  // Use REAL Yahoo history if available, otherwise generate simulated
  let history;
  if(yd?.history&&yd.history.length>50){
    history=yd.history;
  }else{
    history=genHistory(ticker.symbol,ticker.basePrice,type,currentPrice);
  }

  const last=history[history.length-1];
  const prev=history.length>1?history[history.length-2]:last;
  const totalReturn=(((last.total-history[0].price)/history[0].price)*100).toFixed(1);
  const priceReturn=(((last.price-history[0].price)/history[0].price)*100).toFixed(1);
  // Compute YTD from history
  const jan1Str=`${new Date().getFullYear()}-01`;
  const jan1Idx=history.findIndex(d=>d.date>=jan1Str);
  const ytdBase=jan1Idx>=0?history[jan1Idx].price:history[0].price;
  const ytdPct=((currentPrice-ytdBase)/ytdBase*100).toFixed(1);

  const baseRev=(rng()*180+20);
  const revenueHistory=Array.from({length:5},(_,i)=>({year:`${2021+i}`,revenue:+(baseRev*(0.72+i*0.07+rng()*0.08)).toFixed(1),grossProfit:+(baseRev*(0.72+i*0.07+rng()*0.08)*(0.28+rng()*0.22)).toFixed(1),netIncome:+(baseRev*(0.72+i*0.07+rng()*0.08)*(0.06+rng()*0.14)).toFixed(1)}));
  const debtEquity=+(rng()*2.8+0.1).toFixed(2);
  const currentRatio=+(rng()*2.5+0.8).toFixed(2);
  const roe=+(rng()*28+8).toFixed(1);
  const roic=+(rng()*22+6).toFixed(1);
  const prevClose=meta?.prevClose||prev.price;
  const change=currentPrice-prevClose;
  const dateStr=last.date;
  return{...ticker,price:currentPrice,change:+change.toFixed(2),changePct:+((change/prevClose)*100).toFixed(2),
    marketCap:meta?.marketCap?`$${meta.marketCap}`:(`$${(ticker.basePrice*(rng()*5+0.8)*1e9/1e12).toFixed(2)}T`),
    pe:meta?.pe||+(rng()*35+10).toFixed(1),pb:+(rng()*8+1).toFixed(1),eps:meta?.eps||+(rng()*9+1).toFixed(2),
    dividendYield:meta?.divYield||(type==="stock"||type==="etf"?+(rng()*3.5).toFixed(2):0),
    beta:meta?.beta||ticker.beta||(+(rng()*1.5+0.3).toFixed(2)),
    high52w:meta?.high52||+(ticker.basePrice*1.38).toFixed(2),low52w:meta?.low52||+(ticker.basePrice*0.62).toFixed(2),
    revenue:`$${baseRev.toFixed(1)}B`,grossMargin:`${(rng()*38+28).toFixed(1)}%`,
    roe,roic,debtEquity,currentRatio,quickRatio:+(currentRatio*0.7+rng()*0.3).toFixed(2),
    debtRatio:+(rng()*0.6+0.15).toFixed(2),interestCoverage:+(rng()*10+1.5).toFixed(1),
    totalReturn:ytdPct,priceReturn:ytdPct,cumDiv:last.cumDiv,history,revenueHistory,
    hasRealData:!!meta,
    dataAsOf:dateStr};
}

const PERIODS=["1D","1W","1M","3M","6M","YTD","1Y","3Y","5Y","10Y","ALL"];
function sliceByPeriod(history,period){
  const n=history.length;
  if(period==="ALL")return downsample(history,200);
  if(period==="1D"){
    // Last 2 trading days for a visible line
    return history.slice(-2);
  }
  if(period==="1W")return history.slice(-5);
  if(period==="YTD"){
    const lastD=history[n-1]?.dateObj||new Date();
    const jan1=new Date(lastD.getFullYear(),0,1);
    const idx=history.findIndex(d=>d.dateObj>=jan1);
    const slice=idx>=0?history.slice(idx):history.slice(-60);
    return downsample(slice,120);
  }
  const dayMap={"1M":22,"3M":65,"6M":130,"1Y":252,"3Y":756,"5Y":1260,"10Y":2520};
  const days=dayMap[period]||n;
  const slice=history.slice(-Math.min(days,n));
  // Downsample long ranges so chart isn't overloaded
  return downsample(slice,250);
}
// Thin out data to at most `max` points, keeping first & last
function downsample(data,max){
  if(data.length<=max)return data;
  const step=Math.ceil(data.length/max);
  const result=[data[0]];
  for(let i=step;i<data.length-1;i+=step)result.push(data[i]);
  result.push(data[data.length-1]);
  return result;
}

function computeNewWeights(existingHoldings,newSymbol){
  const n=existingHoldings.length;
  if(n===0)return{[newSymbol]:100};
  const newW=+(100/(n+1)).toFixed(1);
  const scale=1-newW/100;
  const weights={[newSymbol]:newW};let used=newW;
  existingHoldings.forEach((h,i)=>{if(i===existingHoldings.length-1){weights[h.symbol]=+Math.max(0,100-used).toFixed(1);}else{const w=+(h.weight*scale).toFixed(1);weights[h.symbol]=w;used+=w;}});
  return weights;
}

function computePortfolioAnalytics(holdings){
  if(!holdings.length)return null;
  const INIT=10000;
  const histLen=holdings[0].stockInfo.history.length;
  // Downsample to ~250 points for performance
  const step=Math.max(1,Math.floor(histLen/250));
  const indices=[0];for(let i=step;i<histLen-1;i+=step)indices.push(i);indices.push(histLen-1);
  const combined=indices.map(i=>{
    let pIdx=0,tIdx=0,divIdx=0;
    holdings.forEach(h=>{const w=h.weight/100;const hist=h.stockInfo.history;if(!hist[i])return;const bp=hist[0].price;pIdx+=(hist[i].price/bp)*w;tIdx+=(hist[i].total/bp)*w;divIdx+=(hist[i].divPortion/bp)*w;});
    const src=holdings[0].stockInfo.history[i];
    return{date:src?.date,dateObj:src?.dateObj,price:+(INIT*pIdx).toFixed(2),total:+(INIT*tIdx).toFixed(2),divPortion:+(INIT*divIdx).toFixed(2)};
  });
  const base=combined[0],last=combined[combined.length-1];
  const totalRet=(((last.total-base.price)/base.price)*100).toFixed(1);
  const priceRet=(((last.price-base.price)/base.price)*100).toFixed(1);
  const incomeRet=(last.divPortion/base.price*100).toFixed(1);
  const rets=combined.slice(1).map((d,i)=>(d.total-combined[i].total)/combined[i].total);
  const avg=rets.reduce((s,r)=>s+r,0)/rets.length;
  const std=Math.sqrt(rets.reduce((s,r)=>s+(r-avg)**2,0)/rets.length);
  // Annualize: step trading days per observation → ~252/step observations per year
  const periodsPerYear=252/step;
  const sharpe=std>0?((avg-0.0002)*Math.sqrt(periodsPerYear)/std).toFixed(2):"0.00";
  const wBeta=holdings.reduce((s,h)=>s+(h.weight/100)*h.stockInfo.beta,0).toFixed(2);
  const RFR=5;
  const scores=holdings.map(h=>Math.max(0.1,(parseFloat(h.stockInfo.totalReturn)-RFR)/Math.max(0.01,h.stockInfo.beta*18)));
  const totalScore=scores.reduce((a,b)=>a+b,0);
  let rem=100;
  const suggested=holdings.map((h,i)=>{const w=i===holdings.length-1?rem:+(scores[i]/totalScore*100).toFixed(1);rem-=w;return{symbol:h.symbol,current:h.weight,suggested:Math.max(1,w)};});
  const healthScore=Math.min(99,Math.max(38,Math.round(parseFloat(sharpe)*12+50-Math.abs(parseFloat(wBeta)-1)*8+(holdings.length>=4?8:0))));
  const sectorMap={};
  holdings.forEach(h=>{sectorMap[h.stockInfo.sector]=(sectorMap[h.stockInfo.sector]||0)+h.weight;});
  const sectors=Object.entries(sectorMap).map(([s,p])=>({sector:s,pct:+p.toFixed(1)})).sort((a,b)=>b.pct-a.pct);
  return{combined,totalRet,priceRet,incomeRet,sharpe,wBeta,suggested,healthScore,sectors};
}

function simulateFrontier(holdings){
  if(holdings.length<2)return null;
  const assets=holdings.map(h=>({ret:parseFloat(h.stockInfo.totalReturn)/100,vol:Math.max(0.05,h.stockInfo.beta*0.18),weight:h.weight/100}));
  const rng=seededRng(holdings.reduce((s,h)=>s+h.symbol.charCodeAt(0),0)*7);
  const curRet=assets.reduce((s,a)=>s+a.ret*a.weight,0);
  const curVol=Math.sqrt(assets.reduce((s,a)=>s+(a.vol*a.weight)**2,0)*1.4);
  const points=[];
  for(let i=0;i<180;i++){
    const raw=assets.map(()=>rng());const sum=raw.reduce((a,b)=>a+b,0);const w=raw.map(r=>r/sum);
    const ret=assets.reduce((s,a,j)=>s+a.ret*w[j],0);
    const vol=Math.sqrt(assets.reduce((s,a,j)=>s+(a.vol*w[j])**2,0)*1.4);
    points.push({x:+(vol*100).toFixed(2),y:+(ret*100).toFixed(2),sharpe:(ret-0.05)/vol});
  }
  const maxSharpe=points.reduce((b,p)=>p.sharpe>b.sharpe?p:b,points[0]);
  const minVol=points.reduce((b,p)=>p.x<b.x?p:b,points[0]);
  const maxRet=points.reduce((b,p)=>p.y>b.y?p:b,points[0]);
  return{points,current:{x:+(curVol*100).toFixed(2),y:+(curRet*100).toFixed(2)},maxSharpe,minVol,maxRet};
}

function generateSummary(stock,lang){
  const zh=lang==="zh";
  const items={strengths:[],risks:[]};
  const margin=parseFloat(stock.grossMargin);
  if(margin>45)items.strengths.push(zh?`毛利率高达${stock.grossMargin}，表明具有强大的定价能力。`:`Exceptional gross margin of ${stock.grossMargin} signals strong pricing power.`);
  else if(margin>30)items.strengths.push(zh?`毛利率${stock.grossMargin}，盈利能力健康。`:`Solid gross margin of ${stock.grossMargin} indicates healthy profitability.`);
  if(stock.dividendYield>2.5)items.strengths.push(zh?`股息率${stock.dividendYield}%，提供稳定收入来源。`:`Attractive dividend yield of ${stock.dividendYield}% provides reliable income.`);
  if(parseFloat(stock.totalReturn)>60)items.strengths.push(zh?`总回报率+${stock.totalReturn}%，展现出色的复利增长。`:`Outstanding total return of +${stock.totalReturn}% demonstrates strong compounding.`);
  if(stock.roic>15)items.strengths.push(zh?`ROIC为${stock.roic}%，超过大多数资本成本门槛——资本运用高效。`:`ROIC of ${stock.roic}% exceeds most hurdle rates — capital deployed efficiently.`);
  if(stock.currentRatio>1.8)items.strengths.push(zh?`流动比率${stock.currentRatio}×，短期流动性充裕。`:`Current ratio of ${stock.currentRatio}× indicates strong short-term liquidity.`);
  if(stock.beta>1.5)items.risks.push(zh?`贝塔值${stock.beta}，约为市场波动的${stock.beta}倍——波动性较高。`:`High beta of ${stock.beta} means ~${stock.beta}× market amplification — elevated volatility.`);
  if(stock.debtEquity>2)items.risks.push(zh?`债务/权益比${stock.debtEquity}×偏高；利率上升可能影响盈利。`:`Debt/equity of ${stock.debtEquity}× is elevated; rising rates could pressure earnings.`);
  if(stock.debtRatio>0.6)items.risks.push(zh?`资产负债率${(stock.debtRatio*100).toFixed(0)}%，大部分资产由债务融资。`:`Debt ratio of ${(stock.debtRatio*100).toFixed(0)}% means majority of assets financed by debt.`);
  if(stock.interestCoverage<3)items.risks.push(zh?`利息覆盖倍数仅${stock.interestCoverage}×，盈利下降时缓冲有限。`:`Low interest coverage of ${stock.interestCoverage}× leaves limited buffer if earnings decline.`);
  if(stock.pe>40)items.risks.push(zh?`市盈率${stock.pe}×，已充分定价高增长预期——安全边际有限。`:`P/E of ${stock.pe}× prices in high growth — limited margin of safety.`);
  if(stock.type==="crypto")items.risks.push(zh?"监管和市场风险较高，应视为投机性配置。":"High regulatory and market risk. Treat as speculative allocation.");
  if(!items.strengths.length)items.strengths.push(zh?"该资产表现稳健。请查看具体比率以获得更深入洞察。":"Asset shows stable characteristics. Review individual ratios for deeper insight.");
  if(!items.risks.length)items.risks.push(zh?"未发现重大风险信号。建议对照实时财务报表进一步验证。":"No major red flags detected. Verify with live financial statements.");
  return items;
}

/* ═══════════ SMALL COMPONENTS ═══════════ */
const Badge=({children,color,T})=>{const c=color||T.acc;return <span style={{fontFamily:T.mono,fontSize:10,fontWeight:600,color:c,background:c+"20",border:`1px solid ${c}30`,padding:"2px 7px",borderRadius:4}}>{children}</span>;};
const Spinner=({T})=><div style={{width:18,height:18,border:`2px solid ${T.bdr}`,borderTop:`2px solid ${T.acc}`,borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>;

function StatCard({label,value,sub,color,glow,T}){
  return(
    <div style={{background:T.sur,border:`1px solid ${glow?color+"60":T.bdr}`,borderRadius:10,padding:"14px 18px",flex:1,minWidth:110,boxShadow:glow?`0 0 22px ${color}18`:"none"}}>
      <div style={{fontFamily:T.body,fontSize:11,color:T.dim,marginBottom:5,letterSpacing:"0.05em",textTransform:"uppercase"}}>{label}</div>
      <div style={{fontFamily:T.mono,fontSize:20,fontWeight:600,color:color||T.text}}>{value}</div>
      {sub&&<div style={{fontFamily:T.mono,fontSize:11,color:T.dim,marginTop:3}}>{sub}</div>}
    </div>
  );
}

function TTip({active,payload,label}){
  if(!active||!payload?.length)return null;
  const bg=document.body.dataset.theme==="light"?"#ffffff":"#1e304d";
  const bdr=document.body.dataset.theme==="light"?"#d0dcf5":"#2e4a72";
  return(
    <div style={{background:bg,border:`1px solid ${bdr}`,borderRadius:8,padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
      <div style={{color:"#7a9ac0",marginBottom:5}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:p.color,marginBottom:2}}>{p.name}: <b>{typeof p.value==="number"?p.value.toFixed(2):p.value}</b></div>)}
    </div>
  );
}

/* ═══════════ PERIOD SELECTOR ═══════════ */
function PeriodSelector({T,period,onPeriod,displayMode,onDisplayMode}){
  return(
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{display:"flex",background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:7,overflow:"hidden"}}>
        {PERIODS.map(p=>(
          <button key={p} onClick={()=>onPeriod(p)} style={{fontFamily:T.mono,fontSize:10,padding:"5px 9px",cursor:"pointer",background:period===p?T.accD:"transparent",color:period===p?T.acc:T.dim,border:"none",borderRight:`1px solid ${T.bdr}`,transition:"all .15s"}}>{p}</button>
        ))}
      </div>
      {onDisplayMode&&(
        <div style={{display:"flex",background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:7,overflow:"hidden"}}>
          {[["$","$"],["pct","%"]].map(([m,lbl])=>(
            <button key={m} onClick={()=>onDisplayMode(m)} style={{fontFamily:T.mono,fontSize:11,fontWeight:600,padding:"5px 12px",cursor:"pointer",background:displayMode===m?T.accD:"transparent",color:displayMode===m?T.acc:T.dim,border:"none",borderRight:m==="$"?`1px solid ${T.bdr}`:"none",transition:"all .15s"}}>{lbl}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ TICKER SEARCH ═══════════ */
function TickerSearch({T,onSelect,compact,placeholder}){
  const [query,setQuery]=useState("");
  const [open,setOpen]=useState(false);
  const ref=useRef();
  const results=useMemo(()=>query.length<1?[]:TICKER_LIST.filter(t=>t.symbol.startsWith(query.toUpperCase())||t.name.toLowerCase().includes(query.toLowerCase())).slice(0,8),[query]);
  useEffect(()=>{const h=e=>{if(!ref.current?.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const typeColor={stock:T.acc,etf:T.grn,fund:T.teal,crypto:T.vio,commodity:T.amb};
  return(
    <div ref={ref} style={{position:"relative",width:compact?260:"100%",maxWidth:compact?260:440,zIndex:9999}}>
      <div style={{position:"relative"}}>
        <input value={query} onChange={e=>{setQuery(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)}
          placeholder={placeholder||"Search ticker or company..."}
          style={{width:"100%",background:T.sur,border:`1px solid ${open&&results.length?T.acc:T.bdr}`,borderRadius:open&&results.length?"8px 8px 0 0":8,padding:compact?"9px 12px 9px 36px":"13px 14px 13px 42px",fontFamily:T.mono,fontSize:compact?12:13,color:T.text,outline:"none",transition:"border-color .2s"}}/>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.dim} strokeWidth="2" style={{position:"absolute",left:compact?11:13,top:"50%",transform:"translateY(-50%)"}}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      {open&&results.length>0&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:99999,background:T.surB,border:`1px solid ${T.acc}`,borderTop:"none",borderRadius:"0 0 8px 8px",overflow:"hidden",boxShadow:`0 8px 32px ${T.shadow}`}}>
          {results.map((t,i)=>(
            <div key={t.symbol} onClick={()=>{onSelect(t);setQuery("");setOpen(false);}}
              style={{padding:"9px 13px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:i>0?`1px solid ${T.bdr}`:"none",transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.accD}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div>
                <span style={{fontFamily:T.mono,fontSize:12,fontWeight:600,color:typeColor[t.type]||T.acc}}>{t.symbol}</span>
                <span style={{fontFamily:T.body,fontSize:12,color:T.dim,marginLeft:8}}>{t.name}</span>
              </div>
              <Badge color={typeColor[t.type]||T.dim} T={T}>{t.type||t.sector}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ RETURN CHART ═══════════ */
function formatDateForPeriod(dateStr,period){
  if(!dateStr)return"";
  // dateStr is "YYYY-MM-DD"
  const parts=dateStr.split("-");
  if(parts.length<3)return dateStr;
  const mo=parseInt(parts[1]),da=parseInt(parts[2]),yr=parts[0];
  const moNames=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if(period==="1D"||period==="1W")return`${moNames[mo]} ${da}`;
  if(period==="1M"||period==="3M")return`${moNames[mo]} ${da}`;
  if(period==="6M"||period==="YTD"||period==="1Y")return`${moNames[mo]} '${yr.slice(2)}`;
  return`${moNames[mo]} '${yr.slice(2)}`;
}
function ReturnChart({T,L,history,title,subtitle,totalRet,priceRet}){
  const [period,setPeriod]=useState("5Y");
  const [displayMode,setDisplayMode]=useState("pct");
  const raw=useMemo(()=>sliceByPeriod(history,period),[history,period]);
  const data=useMemo(()=>{
    if(!raw.length)return[];
    const bp=raw[0].price,bd=raw[0].divPortion||0;
    if(displayMode==="pct"){
      return raw.map(d=>({...d,label:formatDateForPeriod(d.date,period),priceGain:+((d.price/bp-1)*100).toFixed(2),divGain:+((d.divPortion-bd)/bp*100).toFixed(2),totalGain:+((d.total/bp-1)*100).toFixed(2)}));
    } else {
      return raw.map(d=>({...d,label:formatDateForPeriod(d.date,period),priceGain:+(d.price-bp).toFixed(2),divGain:+(d.divPortion-bd).toFixed(2),totalGain:+(d.total-bp).toFixed(2)}));
    }
  },[raw,displayMode,period]);
  const fmt=v=>displayMode==="pct"?`${v?.toFixed(1)}%`:`$${v?.toFixed(0)}`;
  // Decide how many ticks to show
  const tickCount=period==="1D"?data.length:period==="1W"?data.length:Math.min(7,data.length);
  const tickInterval=Math.max(0,Math.floor(data.length/tickCount)-1);

  return(
    <div style={{background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:16,padding:26}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <h3 style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:T.text,marginBottom:3}}>{title}</h3>
          <p style={{fontFamily:T.body,fontSize:12,color:T.dim}}>{subtitle}</p>
        </div>
        <div style={{display:"flex",gap:18}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:T.mono,fontSize:11,color:T.acc}}>{L.totalReturn}</div>
            <div style={{fontFamily:T.mono,fontSize:18,fontWeight:600,color:T.acc}}>+{totalRet}%</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:T.mono,fontSize:11,color:T.dim}}>{L.priceOnly}</div>
            <div style={{fontFamily:T.mono,fontSize:18,fontWeight:600,color:T.dim}}>+{priceRet}%</div>
          </div>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <PeriodSelector T={T} period={period} onPeriod={setPeriod} displayMode={displayMode} onDisplayMode={setDisplayMode}/>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{top:4,right:4,bottom:0,left:0}}>
          <defs>
            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.acc} stopOpacity={0.25}/><stop offset="95%" stopColor={T.acc} stopOpacity={0}/></linearGradient>
            <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.amb} stopOpacity={0.3}/><stop offset="95%" stopColor={T.amb} stopOpacity={0}/></linearGradient>
          </defs>
          <CartesianGrid stroke={T.bdr} strokeDasharray="3 3"/>
          <XAxis dataKey="label" tick={{fontFamily:T.mono,fontSize:10,fill:T.dim}} tickLine={false} interval={tickInterval}/>
          <YAxis tick={{fontFamily:T.mono,fontSize:10,fill:T.dim}} tickLine={false} axisLine={false} tickFormatter={fmt} domain={displayMode==="$"?["dataMin","dataMax"]:[0,"auto"]}/>
          <Tooltip content={<TTip/>} formatter={(v)=>fmt(v)} labelFormatter={(l,payload)=>payload?.[0]?.payload?.date||l}/>
          <Area type="monotone" dataKey="priceGain" stackId="1" stroke={T.acc} fill="url(#gP)" strokeWidth={2} name={L.priceAppreciation} dot={false}/>
          <Area type="monotone" dataKey="divGain" stackId="1" stroke={T.amb} fill="url(#gD)" strokeWidth={1.5} name={L.reinvestStack} dot={false}/>
        </AreaChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:18,marginTop:10,justifyContent:"center",flexWrap:"wrap"}}>
        {[{c:T.acc,l:L.priceAppreciation},{c:T.amb,l:L.reinvestStack}].map((l,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:18,height:2,background:l.c}}/><span style={{fontFamily:T.mono,fontSize:10,color:T.dim}}>{l.l}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ FEEDBACK WIDGET ═══════════ */
function FeedbackWidget({T,L}){
  const [open,setOpen]=useState(false);
  const [r1,setR1]=useState(0);const [hover1,setHover1]=useState(0);
  const [r2,setR2]=useState(0);const [hover2,setHover2]=useState(0);
  const [comment,setComment]=useState("");
  const [gender,setGender]=useState("");
  const [age,setAge]=useState("");
  const [submitted,setSubmitted]=useState(false);

  const handleSubmit=()=>{
    if(!r1||!r2)return;
    try{localStorage.setItem("pfl_feedback",JSON.stringify({q1:r1,q2:r2,comment,gender,age,ts:new Date().toISOString()}));}catch(e){}
    setSubmitted(true);
  };

  const StarRow=({value,hover,onSet,onHover})=>(
    <div style={{display:"flex",gap:4,margin:"8px 0 4px"}}>
      {[1,2,3,4,5].map(s=>(
        <button key={s} onClick={()=>onSet(s)} onMouseEnter={()=>onHover(s)} onMouseLeave={()=>onHover(0)}
          style={{background:"none",border:"none",cursor:"pointer",fontSize:22,transition:"transform .1s",transform:(hover||value)>=s?"scale(1.2)":"scale(1)",color:(hover||value)>=s?T.amb:T.faint}}>★</button>
      ))}
    </div>
  );

  const sel={width:"100%",background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:6,padding:"8px 10px",fontFamily:T.mono,fontSize:12,color:T.text,outline:"none",marginTop:5};

  if(!open)return(
    <button onClick={()=>setOpen(true)} style={{position:"fixed",bottom:28,left:28,zIndex:200,background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:12,padding:"9px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,color:T.dim,fontFamily:T.body,fontSize:12,boxShadow:`0 4px 16px ${T.shadow}`,transition:"all .2s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.amb;e.currentTarget.style.color=T.text;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bdr;e.currentTarget.style.color=T.dim;}}>
      <span style={{fontSize:15}}>★</span>{L.feedbackBtn}
    </button>
  );

  return(
    <div className="slide" style={{position:"fixed",bottom:20,left:20,zIndex:200,width:340,background:T.sur,border:`1px solid ${T.bdrM}`,borderRadius:14,padding:22,boxShadow:`0 8px 40px ${T.shadow}`,maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontFamily:T.disp,fontSize:15,fontWeight:700,color:T.text}}>★ {L.feedbackTitle}</span>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.dim,fontSize:18,lineHeight:1}}>×</button>
      </div>
      {submitted?(
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:32,marginBottom:10}}>🎉</div>
          <p style={{fontFamily:T.body,fontSize:14,color:T.text,marginBottom:4}}>{L.thankYou}</p>
          <p style={{fontFamily:T.body,fontSize:12,color:T.dim}}>{L.thankYouSub}</p>
        </div>
      ):(
        <>
          <div style={{marginBottom:14}}>
            <p style={{fontFamily:T.body,fontSize:13,color:T.text,lineHeight:1.5}}>{L.feedbackQ1}</p>
            <StarRow value={r1} hover={hover1} onSet={setR1} onHover={setHover1}/>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>{L.feedbackNotAtAll}</span><span style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>{L.feedbackLotsHelp}</span></div>
          </div>
          <div style={{marginBottom:14}}>
            <p style={{fontFamily:T.body,fontSize:13,color:T.text,lineHeight:1.5}}>{L.feedbackQ2}</p>
            <StarRow value={r2} hover={hover2} onSet={setR2} onHover={setHover2}/>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>{L.feedbackNotAtAll}</span><span style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>{L.feedbackLotsHelp}</span></div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontFamily:T.mono,fontSize:11,color:T.dim,display:"block",marginBottom:4}}>{L.feedbackGender}</label>
            <select value={gender} onChange={e=>setGender(e.target.value)} style={sel}>
              <option value="">—</option>
              <option value="M">{L.genderM}</option>
              <option value="F">{L.genderF}</option>
              <option value="NB">{L.genderNB}</option>
              <option value="NA">{L.genderNA}</option>
            </select>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontFamily:T.mono,fontSize:11,color:T.dim,display:"block",marginBottom:4}}>{L.feedbackAge}</label>
            <select value={age} onChange={e=>setAge(e.target.value)} style={sel}>
              <option value="">—</option>
              <option value="lt20">{L.ageLt20}</option>
              <option value="20-29">{L.age2029}</option>
              <option value="30-39">{L.age3039}</option>
              <option value="40-59">{L.age4059}</option>
              <option value="60+">{L.age60}</option>
            </select>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontFamily:T.mono,fontSize:11,color:T.dim,display:"block",marginBottom:4}}>{L.feedbackComment}</label>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder={L.feedbackCommentPlaceholder} rows={3}
              style={{...sel,resize:"vertical",minHeight:72,fontFamily:T.body,lineHeight:1.5}}/>
          </div>
          <button disabled={!r1||!r2} onClick={handleSubmit}
            style={{width:"100%",fontFamily:T.disp,fontSize:13,fontWeight:700,color:r1&&r2?"#fff":T.dim,background:r1&&r2?T.amb:T.surB,border:"none",borderRadius:8,padding:"11px",cursor:r1&&r2?"pointer":"not-allowed",transition:"all .2s",opacity:r1&&r2?1:0.5}}>
            {L.submitFeedback}
          </button>
        </>
      )}
    </div>
  );
}

/* ═══════════ EXECUTIVE SUMMARY ═══════════ */
function ExecutiveSummary({T,L,stock}){
  const [open,setOpen]=useState(false);
  const lang=L.back==="← 返回"?"zh":"en";
  const summary=useMemo(()=>generateSummary(stock,lang),[stock.symbol,lang]);
  return(
    <div style={{background:T.surB,border:`1px solid ${T.bdrM}`,borderRadius:10,overflow:"hidden",marginBottom:18}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 18px",background:"none",border:"none",cursor:"pointer"}}>
        <span style={{fontFamily:T.disp,fontSize:14,fontWeight:700,color:T.text}}>{L.execSummary}</span>
        <span style={{fontFamily:T.mono,fontSize:12,color:T.dim}}>{open?L.collapse:L.expand}</span>
      </button>
      {open&&(
        <div style={{padding:"0 18px 18px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <div style={{fontFamily:T.mono,fontSize:11,color:T.grn,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>{L.strengths}</div>
              {summary.strengths.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:7}}><span style={{color:T.grn,flexShrink:0}}>•</span><span style={{fontFamily:T.body,fontSize:12,color:T.text,lineHeight:1.55}}>{s}</span></div>
              ))}
            </div>
            <div>
              <div style={{fontFamily:T.mono,fontSize:11,color:T.red,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>{L.riskFactors}</div>
              {summary.risks.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:7}}><span style={{color:T.amb,flexShrink:0}}>•</span><span style={{fontFamily:T.body,fontSize:12,color:T.text,lineHeight:1.55}}>{s}</span></div>
              ))}
            </div>
          </div>
          <div style={{fontFamily:T.mono,fontSize:10,color:T.faint,marginTop:8,textAlign:"right"}}>{stock.hasRealData?(L.dataAsOfLabel?L.dataAsOfLabel(stock.dataAsOf):stock.dataAsOf):`${stock.dataAsOf} · ${L.simData}`}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════ DEEP ANALYSIS ═══════════ */
function DeepAnalysisPanel({T,L,stock}){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("ratios");
  useEffect(()=>{
    setLoading(true);setData(null);
    const rng=seededRng(stock.symbol.charCodeAt(0)*53);
    setTimeout(()=>{
      setData({
        dupont:{netMargin:+(rng()*20+8).toFixed(1),assetTurnover:+(rng()*0.8+0.4).toFixed(2),leverage:+(rng()*2+1.5).toFixed(2),roe:stock.roe},
        valuation:{evEbitda:+(rng()*20+7).toFixed(1),pFcf:+(rng()*28+10).toFixed(1),pb:stock.pb,evSales:+(rng()*6+1).toFixed(1),dcfFairValue:+(stock.price*(rng()*0.5+0.85)).toFixed(2),ddmValue:stock.dividendYield>0?+(stock.price*(0.9+rng()*0.3)).toFixed(2):null},
        quality:{fcfYield:+(rng()*4+1).toFixed(2),accrualsRatio:+(rng()*0.08-0.02).toFixed(3),fcfConversion:+(rng()*30+65).toFixed(1),netDebtEbitda:+(rng()*3.2).toFixed(2),roicTrend:[+(stock.roic*0.7).toFixed(1),+(stock.roic*0.82).toFixed(1),+(stock.roic*0.91).toFixed(1),+(stock.roic*0.96).toFixed(1),+stock.roic]},
        historicalPE:Array.from({length:5},(_,i)=>({year:`${2021+i}`,pe:+(rng()*24+11).toFixed(1)})),
      });
      setLoading(false);
    },1400);
  },[stock.symbol]);

  const tabs=[["ratios",L.ratiosTab],["valuation",L.valuationTab],["quality",L.qualityTab],["revenue",L.revenueTab],["dupont",L.dupontTab]];

  return(
    <div style={{marginTop:20,background:T.sur,border:`1px solid ${T.amb}30`,borderRadius:16,padding:26}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        <span style={{fontSize:16}}>⚡</span>
        <h3 style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:T.amb}}>{L.deepAnalysisTitle} — {stock.symbol}</h3>
        {loading&&<Spinner T={T}/>}
      </div>
      <ExecutiveSummary T={T} L={L} stock={stock}/>
      {loading&&<div style={{color:T.dim,fontFamily:T.body,fontSize:13}}>{L.computing}</div>}
      {data&&(
        <>
          <div style={{display:"flex",gap:0,background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:8,overflow:"hidden",marginBottom:20}}>
            {tabs.map(([k,lbl])=>(
              <button key={k} onClick={()=>setTab(k)} style={{flex:1,fontFamily:T.mono,fontSize:10,padding:"8px 2px",cursor:"pointer",background:tab===k?T.ambD:"transparent",color:tab===k?T.amb:T.dim,border:"none",borderRight:`1px solid ${T.bdr}`,transition:"all .15s"}}>{lbl}</button>
            ))}
          </div>
          {tab==="ratios"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div>
                <h4 style={{fontFamily:T.mono,fontSize:11,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{L.leverageDebt}</h4>
                {[{l:L.debtEquity,v:`${stock.debtEquity}×`,col:stock.debtEquity>2.5?T.red:stock.debtEquity>1.5?T.amb:T.grn},{l:L.debtRatio,v:`${(stock.debtRatio*100).toFixed(0)}%`,col:stock.debtRatio>0.6?T.red:stock.debtRatio>0.4?T.amb:T.grn},{l:L.interestCoverage,v:`${stock.interestCoverage}×`,col:stock.interestCoverage<2?T.red:stock.interestCoverage<4?T.amb:T.grn},{l:L.netDebtEbitda,v:`${data.quality.netDebtEbitda}×`,col:data.quality.netDebtEbitda>4?T.red:data.quality.netDebtEbitda>2?T.amb:T.grn}].map(r=>(
                  <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",marginBottom:4,background:T.surB,borderRadius:6}}>
                    <span style={{fontFamily:T.body,fontSize:12,color:T.dim}}>{r.l}</span>
                    <span style={{fontFamily:T.mono,fontSize:12,fontWeight:600,color:r.col||T.text}}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 style={{fontFamily:T.mono,fontSize:11,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{L.liquidityReturns}</h4>
                {[{l:L.currentRatio,v:`${stock.currentRatio}×`,col:stock.currentRatio<1?T.red:stock.currentRatio<1.5?T.amb:T.grn},{l:L.quickRatio,v:`${stock.quickRatio}×`,col:stock.quickRatio<0.8?T.red:stock.quickRatio<1.2?T.amb:T.grn},{l:L.roe,v:`${stock.roe}%`,col:stock.roe>20?T.grn:stock.roe>10?T.acc:T.dim},{l:L.roic,v:`${stock.roic}%`,col:stock.roic>15?T.grn:stock.roic>8?T.acc:T.dim}].map(r=>(
                  <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",marginBottom:4,background:T.surB,borderRadius:6}}>
                    <span style={{fontFamily:T.body,fontSize:12,color:T.dim}}>{r.l}</span>
                    <span style={{fontFamily:T.mono,fontSize:12,fontWeight:600,color:r.col||T.text}}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="valuation"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div>
                <h4 style={{fontFamily:T.mono,fontSize:11,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{L.multiples}</h4>
                {[{l:"P/E",v:`${stock.pe}×`},{l:"P/B",v:`${stock.pb}×`},{l:"EV/EBITDA",v:`${data.valuation.evEbitda}×`},{l:"EV/Sales",v:`${data.valuation.evSales}×`},{l:"P/FCF",v:`${data.valuation.pFcf}×`}].map(r=>(
                  <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",marginBottom:4,background:T.surB,borderRadius:6}}>
                    <span style={{fontFamily:T.body,fontSize:12,color:T.dim}}>{r.l}</span>
                    <span style={{fontFamily:T.mono,fontSize:12,fontWeight:600,color:T.text}}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 style={{fontFamily:T.mono,fontSize:11,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{L.intrinsicValue}</h4>
                <div style={{background:T.surB,borderRadius:8,padding:14,marginBottom:10}}>
                  <div style={{fontFamily:T.mono,fontSize:11,color:T.dim,marginBottom:4}}>{L.dcfFairValue}</div>
                  <div style={{fontFamily:T.mono,fontSize:22,fontWeight:700,color:data.valuation.dcfFairValue>stock.price?T.grn:T.red}}>${data.valuation.dcfFairValue}</div>
                  <div style={{fontFamily:T.mono,fontSize:11,color:T.dim,marginTop:3}}>{data.valuation.dcfFairValue>stock.price?L.undervalued:L.overvalued} {Math.abs(((data.valuation.dcfFairValue-stock.price)/stock.price)*100).toFixed(1)}%</div>
                </div>
                {data.valuation.ddmValue&&(
                  <div style={{background:T.surB,borderRadius:8,padding:14,marginBottom:10}}>
                    <div style={{fontFamily:T.mono,fontSize:11,color:T.dim,marginBottom:4}}>{L.ddmLabel}</div>
                    <div style={{fontFamily:T.mono,fontSize:22,fontWeight:700,color:T.acc}}>${data.valuation.ddmValue}</div>
                  </div>
                )}
                <div>
                  <div style={{fontFamily:T.mono,fontSize:10,color:T.dim,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:6}}>{L.historicalPE}</div>
                  <ResponsiveContainer width="100%" height={90}>
                    <BarChart data={data.historicalPE} margin={{top:2,right:4,bottom:0,left:0}}>
                      <XAxis dataKey="year" tick={{fontFamily:T.mono,fontSize:9,fill:T.dim}} tickLine={false}/>
                      <YAxis hide/><Tooltip content={<TTip/>}/>
                      <Bar dataKey="pe" radius={[4,4,0,0]} name="P/E">
                        {data.historicalPE.map((_,i)=><Cell key={i} fill={i===data.historicalPE.length-1?T.acc:T.bdrM}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          {tab==="quality"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div>
                <h4 style={{fontFamily:T.mono,fontSize:11,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{L.earningsQuality}</h4>
                {[{l:L.fcfYield,v:`${data.quality.fcfYield}%`},{l:L.fcfConversion,v:`${data.quality.fcfConversion}%`,col:data.quality.fcfConversion>80?T.grn:data.quality.fcfConversion>60?T.acc:T.red},{l:L.accrualsRatio,v:data.quality.accrualsRatio,col:Math.abs(data.quality.accrualsRatio)<0.03?T.grn:T.amb}].map(r=>(
                  <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",marginBottom:4,background:T.surB,borderRadius:6}}>
                    <span style={{fontFamily:T.body,fontSize:12,color:T.dim}}>{r.l}</span>
                    <span style={{fontFamily:T.mono,fontSize:12,fontWeight:600,color:r.col||T.text}}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 style={{fontFamily:T.mono,fontSize:11,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{L.roicTrend}</h4>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={data.quality.roicTrend.map((v,i)=>({year:`${2021+i}`,roic:v}))} margin={{top:4,right:4,bottom:0,left:0}}>
                    <defs><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.teal} stopOpacity={0.25}/><stop offset="95%" stopColor={T.teal} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid stroke={T.bdr} strokeDasharray="3 3"/>
                    <XAxis dataKey="year" tick={{fontFamily:T.mono,fontSize:10,fill:T.dim}} tickLine={false}/>
                    <YAxis tick={{fontFamily:T.mono,fontSize:10,fill:T.dim}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`}/>
                    <Tooltip content={<TTip/>}/>
                    <Area type="monotone" dataKey="roic" stroke={T.teal} fill="url(#gR)" strokeWidth={2} name="ROIC %" dot={{r:3,fill:T.teal}}/>
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{fontFamily:T.body,fontSize:11,color:T.dim,marginTop:6,textAlign:"center"}}>{L.roicMoat}</div>
              </div>
            </div>
          )}
          {tab==="revenue"&&(
            <div>
              <h4 style={{fontFamily:T.mono,fontSize:11,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>{L.financialTrend}</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stock.revenueHistory} margin={{top:4,right:4,bottom:0,left:0}}>
                  <CartesianGrid stroke={T.bdr} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="year" tick={{fontFamily:T.mono,fontSize:10,fill:T.dim}} tickLine={false}/>
                  <YAxis tick={{fontFamily:T.mono,fontSize:10,fill:T.dim}} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}B`}/>
                  <Tooltip content={<TTip/>}/>
                  <Bar dataKey="revenue" name={L.revenueLabel||"Revenue ($B)"} fill={T.acc} radius={[4,4,0,0]} opacity={0.9}/>
                  <Bar dataKey="grossProfit" name={L.grossProfitLabel||"Gross Profit ($B)"} fill={T.grn} radius={[4,4,0,0]} opacity={0.85}/>
                  <Bar dataKey="netIncome" name={L.netIncomeLabel||"Net Income ($B)"} fill={T.amb} radius={[4,4,0,0]} opacity={0.8}/>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:16,marginTop:10,justifyContent:"center"}}>
                {[{c:T.acc,l:L.revenueLabel||"Revenue"},{c:T.grn,l:L.grossProfitLabel||"Gross Profit"},{c:T.amb,l:L.netIncomeLabel||"Net Income"}].map(l=>(
                  <div key={l.l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:12,borderRadius:3,background:l.c}}/><span style={{fontFamily:T.mono,fontSize:10,color:T.dim}}>{l.l}</span></div>
                ))}
              </div>
              <div style={{marginTop:18}}>
                <h4 style={{fontFamily:T.mono,fontSize:11,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{L.yoyGrowth}</h4>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {stock.revenueHistory.slice(1).map((y,i)=>{
                    const prev=stock.revenueHistory[i];
                    const growth=((y.revenue-prev.revenue)/prev.revenue*100).toFixed(1);
                    const col=growth>0?T.grn:T.red;
                    return(
                      <div key={y.year} style={{background:T.surB,border:`1px solid ${col}30`,borderRadius:8,padding:"10px 14px",flex:1,minWidth:70,textAlign:"center"}}>
                        <div style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginBottom:3}}>{y.year}</div>
                        <div style={{fontFamily:T.mono,fontSize:14,fontWeight:600,color:col}}>{growth>0?"+":""}{growth}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {tab==="dupont"&&(
            <div>
              <h4 style={{fontFamily:T.mono,fontSize:11,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>{L.dupontTitle}</h4>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:16}}>
                {[{l:L.netMargin,v:`${data.dupont.netMargin}%`},{l:"×",v:null},{l:L.assetTurnover,v:`${data.dupont.assetTurnover}×`},{l:"×",v:null},{l:L.leverage,v:`${data.dupont.leverage}×`},{l:"=",v:null},{l:"ROE",v:`${data.dupont.roe}%`,hi:true}].map((item,i)=>
                  item.v===null?<span key={i} style={{fontFamily:T.mono,fontSize:18,color:T.faint}}>{item.l}</span>:(
                    <div key={i} style={{background:item.hi?T.ambD:T.surB,border:`1px solid ${item.hi?T.amb+"40":T.bdr}`,borderRadius:8,padding:"10px 16px",textAlign:"center"}}>
                      <div style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginBottom:4}}>{item.l}</div>
                      <div style={{fontFamily:T.mono,fontSize:15,fontWeight:600,color:item.hi?T.amb:T.text}}>{item.v}</div>
                    </div>
                  )
                )}
              </div>
              <div style={{background:T.surB,borderRadius:8,padding:14,fontFamily:T.body,fontSize:12,color:T.dim,lineHeight:1.6}}>
                {L.dupontExplain}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════ EFFICIENT FRONTIER ═══════════ */
function EfficientFrontierPanel({T,L,holdings}){
  const [scenario,setScenario]=useState(null);
  const frontier=useMemo(()=>simulateFrontier(holdings),[holdings.length]);
  if(!frontier)return null;
  const {points,current,maxSharpe,minVol,maxRet}=frontier;
  const scenarios=[
    {key:"sharpe",label:L.maxSharpeLabel,color:T.grn,pt:maxSharpe,desc:L.maxSharpeDesc2},
    {key:"vol",label:L.minVolLabel,color:T.teal,pt:minVol,desc:L.minVolDesc},
    {key:"ret",label:L.maxRetLabel,color:T.vio,pt:maxRet,desc:L.maxRetDesc},
  ];
  return(
    <div style={{background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:16,padding:26,marginBottom:20}}>
      <div style={{marginBottom:14}}>
        <h3 style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:T.text,marginBottom:4}}>{L.efficientFrontier}</h3>
        <p style={{fontFamily:T.body,fontSize:12,color:T.dim,lineHeight:1.6,maxWidth:680}}>{L.efDesc} <strong style={{color:T.acc}}>{L.yourPortfolio}</strong> {L.efHighlighted}</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{top:10,right:20,bottom:20,left:10}}>
          <CartesianGrid stroke={T.bdr} strokeDasharray="3 3"/>
          <XAxis dataKey="x" name="Risk" type="number" domain={["auto","auto"]} tick={{fontFamily:T.mono,fontSize:10,fill:T.dim}} tickLine={false} label={{value:`${L.risk} (%)`,position:"insideBottom",offset:-10,style:{fontFamily:T.mono,fontSize:10,fill:T.dim}}}/>
          <YAxis dataKey="y" name="Return" type="number" domain={["auto","auto"]} tick={{fontFamily:T.mono,fontSize:10,fill:T.dim}} tickLine={false} axisLine={false}/>
          <Tooltip cursor={{strokeDasharray:"3 3"}} content={({active,payload})=>{
            if(!active||!payload?.length)return null;
            const d=payload[0]?.payload;
            return <div style={{background:T.surB,border:`1px solid ${T.bdrM}`,borderRadius:8,padding:"8px 12px",fontFamily:T.mono,fontSize:11}}><div style={{color:T.dim}}>{L.risk}: {d?.x}% · {L.expected}: {d?.y}%</div></div>;
          }}/>
          <Scatter data={points} fill={T.faint} opacity={0.5}/>
          <Scatter data={[current]} fill={T.acc} r={7}/>
          {scenarios.map(s=><Scatter key={s.key} data={[s.pt]} fill={s.color} r={6}/>)}
        </ScatterChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:12,marginTop:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:"50%",background:T.acc}}/><span style={{fontFamily:T.mono,fontSize:10,color:T.dim}}>{L.yourPortfolio}</span></div>
        {scenarios.map(s=><div key={s.key} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:"50%",background:s.color}}/><span style={{fontFamily:T.mono,fontSize:10,color:T.dim}}>{s.label}</span></div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:14}}>
        {scenarios.map(s=>(
          <div key={s.key} onClick={()=>setScenario(scenario===s.key?null:s.key)}
            style={{background:scenario===s.key?s.color+"20":T.surB,border:`1px solid ${scenario===s.key?s.color+"50":T.bdr}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",transition:"all .2s"}}>
            <div style={{fontFamily:T.mono,fontSize:11,fontWeight:600,color:s.color,marginBottom:3}}>{s.label}</div>
            <div style={{fontFamily:T.body,fontSize:11,color:T.dim,marginBottom:8}}>{s.desc}</div>
            <div style={{fontFamily:T.mono,fontSize:11,color:T.dim}}>{L.risk}: <b style={{color:T.text}}>{s.pt.x}%</b></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ AI CHAT ═══════════ */
function AIChatPanel({T,L,holdings,onApplyWeights}){
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState([{role:"ai",text:L.aiWelcome}]);
  const [input,setInput]=useState("");
  const [pending,setPending]=useState(null);
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef();
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const handleSend=()=>{
    if(!input.trim()||loading)return;
    const msg=input.trim();setInput("");
    setMsgs(m=>[...m,{role:"user",text:msg}]);
    setLoading(true);
    setTimeout(()=>{
      const lower=msg.toLowerCase();
      const n=holdings.length;
      if(!n){setMsgs(m=>[...m,{role:"ai",text:L.aiEmptyPortfolio}]);setLoading(false);return;}
      // Check if user mentions a ticker not in portfolio
      const mentionedTicker=TICKER_LIST.find(t=>{
        const sym=t.symbol.toLowerCase();
        return lower.includes(` ${sym} `)||lower.startsWith(`${sym} `)||lower.endsWith(` ${sym}`)||lower===sym||lower.includes(`${sym},`)||lower.includes(`about ${sym}`)||lower.includes(`for ${sym}`);
      });
      if(mentionedTicker&&!holdings.find(h=>h.symbol===mentionedTicker.symbol)){
        setMsgs(m=>[...m,{role:"ai",text:L.aiNotInPortfolio(mentionedTicker.symbol)}]);
        setLoading(false);return;
      }
      const base=holdings.map(h=>({symbol:h.symbol,current:h.weight,stockInfo:h.stockInfo}));
      let intent="",adjustments=[];
      const zh=L.back==="← 返回";
      if(lower.includes("income")||lower.includes("dividend")||lower.includes("分红")||lower.includes("收益")){
        intent="income";
        const sorted=[...base].sort((a,b)=>b.stockInfo.dividendYield-a.stockInfo.dividendYield);
        let rem=100;
        adjustments=sorted.map((h,i)=>{const w=i===sorted.length-1?rem:+(Math.max(5,h.current+(i<Math.ceil(n/2)?8:-8))).toFixed(1);rem-=Math.max(0,w);return{...h,suggested:Math.max(0,w),reason:i<Math.ceil(n/2)?(zh?"高股息率":"High yield"):(zh?"低股息率":"Low yield")};});
      }else if(lower.includes("sharpe")||lower.includes("risk-adjusted")||lower.includes("夏普")){
        intent="sharpe";
        const RFR=5;
        const scores=base.map(h=>Math.max(0.1,(parseFloat(h.stockInfo.totalReturn)-RFR)/Math.max(0.01,h.stockInfo.beta*18)));
        const total=scores.reduce((a,b)=>a+b,0);let rem=100;
        adjustments=base.map((h,i)=>{const w=i===base.length-1?rem:+(scores[i]/total*100).toFixed(1);rem-=w;return{...h,suggested:Math.max(1,w),reason:`${zh?"评分":"Score"}:${scores[i].toFixed(1)}`};});
      }else if(lower.includes("growth")||lower.includes("return")||lower.includes("增长")||lower.includes("回报")){
        intent="growth";
        const sorted=[...base].sort((a,b)=>parseFloat(b.stockInfo.totalReturn)-parseFloat(a.stockInfo.totalReturn));
        let rem=100;
        adjustments=sorted.map((h,i)=>{const w=i===sorted.length-1?rem:+(Math.max(5,h.current+(i<Math.ceil(n/2)?9:-9))).toFixed(1);rem-=Math.max(0,w);return{...h,suggested:Math.max(0,w),reason:i<Math.ceil(n/2)?(zh?"强回报":"Strong return"):(zh?"低回报":"Lower return")};});
      }else if(lower.includes("risk")||lower.includes("safe")||lower.includes("stable")||lower.includes("风险")||lower.includes("稳健")){
        intent="risk";
        const sorted=[...base].sort((a,b)=>a.stockInfo.beta-b.stockInfo.beta);
        let rem=100;
        adjustments=sorted.map((h,i)=>{const w=i===sorted.length-1?rem:+(Math.max(5,h.current+(i<Math.ceil(n/2)?8:-8))).toFixed(1);rem-=Math.max(0,w);return{...h,suggested:Math.max(0,w),reason:i<Math.ceil(n/2)?(zh?"低贝塔":"Low beta"):(zh?"高贝塔":"High beta")};});
      }else{
        setMsgs(m=>[...m,{role:"ai",text:L.aiUnknown}]);setLoading(false);return;
      }
      const total=adjustments.reduce((s,a)=>s+a.suggested,0);
      if(total>0)adjustments=adjustments.map(a=>({...a,suggested:+(a.suggested/total*100).toFixed(1)}));
      setPending(adjustments);
      setMsgs(m=>[...m,{role:"ai",text:L.aiAdjusted?L.aiAdjusted(L.aiLabel[intent]):`Adjusted weights to ${L.aiLabel[intent]}. Review below.`,adjustments}]);
      setLoading(false);
    },1100);
  };

  if(!open)return(
    <button onClick={()=>setOpen(true)} style={{position:"fixed",bottom:28,right:28,zIndex:200,width:52,height:52,borderRadius:"50%",background:T.vio,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 22px ${T.vio}50`,transition:"transform .2s"}}
      onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
  );
  return(
    <div className="slide" style={{position:"fixed",bottom:20,right:20,zIndex:200,width:360,maxHeight:520,background:T.sur,border:`1px solid ${T.vio}50`,borderRadius:16,display:"flex",flexDirection:"column",boxShadow:`0 8px 40px ${T.shadow}`}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:T.vio,animation:"pulse 2s ease infinite"}}/>
          <span style={{fontFamily:T.disp,fontSize:14,fontWeight:700,color:T.text}}>{L.portfolioAI}</span>
        </div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.dim,fontSize:18}}>×</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"90%",background:m.role==="user"?T.vioD:T.surB,border:`1px solid ${m.role==="user"?T.vio+"40":T.bdr}`,borderRadius:10,padding:"9px 12px"}}>
              <p style={{fontFamily:T.body,fontSize:12,color:T.text,lineHeight:1.5}}>{m.text}</p>
              {m.adjustments&&pending&&(
                <div style={{marginTop:10}}>
                  <div style={{background:T.bg,borderRadius:7,overflow:"hidden",marginBottom:8}}>
                    <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 2fr",padding:"5px 8px",borderBottom:`1px solid ${T.bdr}`}}>
                      {[L.ticker||"Ticker",L.current,L.newWeight||"New",L.reason||"Reason"].map(h=><span key={h} style={{fontFamily:T.mono,fontSize:9,color:T.faint,textTransform:"uppercase"}}>{h}</span>)}
                    </div>
                    {m.adjustments.map(a=>{const delta=a.suggested-a.current;return(
                      <div key={a.symbol} style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 2fr",padding:"5px 8px",borderBottom:`1px solid ${T.bdr}`}}>
                        <span style={{fontFamily:T.mono,fontSize:10,fontWeight:600,color:T.acc}}>{a.symbol}</span>
                        <span style={{fontFamily:T.mono,fontSize:10,color:T.dim}}>{a.current}%</span>
                        <span style={{fontFamily:T.mono,fontSize:10,color:delta>0?T.grn:delta<0?T.red:T.dim}}>{a.suggested}%{delta>0?" ↑":delta<0?" ↓":""}</span>
                        <span style={{fontFamily:T.body,fontSize:9,color:T.dim}}>{a.reason}</span>
                      </div>
                    );})}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{onApplyWeights(pending);setPending(null);setMsgs(m=>[...m,{role:"ai",text:L.aiApplied}]);}} style={{flex:2,fontFamily:T.disp,fontSize:11,fontWeight:700,color:"#fff",background:T.vio,border:"none",borderRadius:6,padding:"7px",cursor:"pointer"}}>{L.apply}</button>
                    <button onClick={()=>setPending(null)} style={{flex:1,fontFamily:T.disp,fontSize:11,color:T.dim,background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:6,padding:"7px",cursor:"pointer"}}>{L.discard}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:5,padding:"4px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.vio,animation:`pulse 1.2s ${i*0.2}s ease infinite`}}/>)}</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"12px 14px",borderTop:`1px solid ${T.bdr}`,display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder={L.askPortfolio} disabled={loading}
          style={{flex:1,background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:8,padding:"9px 12px",fontFamily:T.body,fontSize:12,color:T.text,outline:"none"}}/>
        <button onClick={handleSend} disabled={loading||!input.trim()} style={{width:36,height:36,borderRadius:8,background:T.vioD,border:`1px solid ${T.vio}40`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:loading||!input.trim()?0.4:1}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.vio} strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4z"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ═══════════ HOME SCREEN ═══════════ */
function HomeScreen({T,L,onTickerSelect,portfolios,onViewPortfolios,onCreatePortfolio}){
  const [quickTickers,setQuickTickers]=useState([]);
  const handleAddQuick=t=>{if(!quickTickers.find(x=>x.symbol===t.symbol))setQuickTickers(p=>[...p,t]);};
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:"52px 22px"}}>
      <div className="fu" style={{textAlign:"center",marginBottom:56}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:T.accD,border:`1px solid ${T.acc}30`,borderRadius:20,padding:"5px 14px",marginBottom:18}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:T.grn,animation:"pulse 2s ease infinite"}}/>
          <span style={{fontFamily:T.mono,fontSize:11,color:T.acc,letterSpacing:"0.08em"}}>{L.appTagline}</span>
        </div>
        <h1 style={{fontFamily:T.disp,fontSize:42,fontWeight:800,color:T.text,lineHeight:1.15,marginBottom:14}}>
          {L.homeH1a}<br/><span style={{color:T.acc}}>{L.homeH1b}</span>{L.homeH1c}
        </h1>
        <p style={{fontFamily:T.body,fontSize:15,color:T.dim,maxWidth:460,margin:"0 auto"}}>{L.homeSubtitle}</p>
      </div>
      <div className="fu1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:36}}>
        <div style={{background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:16,padding:30}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:34,height:34,borderRadius:9,background:T.accD,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </div>
            <h2 style={{fontFamily:T.disp,fontSize:17,fontWeight:700,color:T.text}}>{L.researchTitle}</h2>
          </div>
          <p style={{fontFamily:T.body,fontSize:13,color:T.dim,marginBottom:18,lineHeight:1.6}}>{L.researchDesc}</p>
          <TickerSearch T={T} onSelect={t=>onTickerSelect(t)}/>
        </div>
        <div style={{background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:16,padding:30}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:34,height:34,borderRadius:9,background:T.vioD,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.vio} strokeWidth="2"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <h2 style={{fontFamily:T.disp,fontSize:17,fontWeight:700,color:T.text}}>{L.buildTitle}</h2>
          </div>
          <p style={{fontFamily:T.body,fontSize:13,color:T.dim,marginBottom:18,lineHeight:1.6}}>{L.buildDesc}</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <TickerSearch T={T} onSelect={handleAddQuick} compact/>
            {quickTickers.length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {quickTickers.map(t=>(
                  <span key={t.symbol} style={{fontFamily:T.mono,fontSize:12,color:T.vio,background:T.vioD,border:`1px solid ${T.vio}30`,borderRadius:6,padding:"3px 10px"}}>
                    {t.symbol}<span onClick={()=>setQuickTickers(p=>p.filter(x=>x.symbol!==t.symbol))} style={{marginLeft:6,cursor:"pointer",color:T.dim}}>×</span>
                  </span>
                ))}
              </div>
            )}
            {quickTickers.length===0&&(
              <div style={{fontFamily:T.mono,fontSize:11,color:T.amb,background:T.ambD,border:`1px solid ${T.amb}30`,borderRadius:6,padding:"8px 12px"}}>{L.addTickerWarn}</div>
            )}
            <button disabled={quickTickers.length===0} onClick={()=>quickTickers.length>0&&onCreatePortfolio(quickTickers)}
              style={{fontFamily:T.disp,fontSize:13,fontWeight:700,color:quickTickers.length===0?T.faint:T.vio,background:quickTickers.length===0?"transparent":T.vioD,border:`1px solid ${quickTickers.length===0?T.bdr:T.vio+"40"}`,borderRadius:8,padding:"10px 16px",cursor:quickTickers.length===0?"not-allowed":"pointer",textAlign:"left",transition:"all .2s",opacity:quickTickers.length===0?0.45:1}}
              onMouseEnter={e=>{if(quickTickers.length>0)e.currentTarget.style.background=T.vio+"30";}}
              onMouseLeave={e=>{if(quickTickers.length>0)e.currentTarget.style.background=T.vioD;}}>
              {L.createBtn(quickTickers.length)}
            </button>
          </div>
        </div>
      </div>
      {portfolios.length>0&&(
        <div className="fu2">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontFamily:T.disp,fontSize:14,fontWeight:700,color:T.dim}}>{L.yourPortfolios}</h3>
            {/* FIX: pass null explicitly so the handler gets undefined-like, not an event object */}
            <button onClick={()=>onViewPortfolios(null)} style={{fontFamily:T.mono,fontSize:12,color:T.acc,background:"none",border:"none",cursor:"pointer"}}>{L.viewAll}</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {portfolios.slice(0,4).map(p=>(
              <div key={p.id} onClick={()=>onViewPortfolios(p)} style={{background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:12,padding:16,cursor:"pointer",transition:"border-color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.acc} onMouseLeave={e=>e.currentTarget.style.borderColor=T.bdr}>
                <div style={{fontFamily:T.disp,fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>{p.name}</div>
                <div style={{fontFamily:T.mono,fontSize:12,color:T.dim}}>{L.nHoldings?L.nHoldings(p.holdings.length):`${p.holdings.length} holdings`}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════ TICKER SCREEN ═══════════ */
function TickerScreen({T,L,stock,portfolios,onAddToPortfolio,onBack,onNavigateTicker}){
  const [loading,setLoading]=useState(true);
  const [showDeep,setShowDeep]=useState(false);
  const isUp=stock.changePct>=0;
  useEffect(()=>{setLoading(true);const t=setTimeout(()=>setLoading(false),600);return()=>clearTimeout(t);},[stock.symbol]);
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:"30px 22px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <button onClick={onBack} style={{fontFamily:T.mono,fontSize:12,color:T.dim,background:"none",border:"none",cursor:"pointer"}}>{L.back}</button>
      </div>
      {loading?(<div style={{display:"flex",alignItems:"center",gap:14,padding:"50px 0"}}><Spinner T={T}/><span style={{fontFamily:T.body,color:T.dim}}>{L.loading(stock.symbol)}</span></div>):(
        <>
          <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:14}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                <h1 style={{fontFamily:T.disp,fontSize:32,fontWeight:800,color:T.text}}>{stock.symbol}</h1>
                <Badge color={{stock:T.acc,etf:T.grn,fund:T.teal,crypto:T.vio,commodity:T.amb}[stock.type]||T.acc} T={T}>{stock.type}</Badge>
                <Badge color={T.dim} T={T}>{stock.sector}</Badge>
              </div>
              <div style={{fontFamily:T.body,fontSize:14,color:T.dim,marginBottom:6}}>{stock.name}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:12}}>
                <span style={{fontFamily:T.mono,fontSize:34,fontWeight:700,color:T.text,letterSpacing:"-0.02em"}}>${stock.price.toFixed(2)}</span>
                <span style={{fontFamily:T.mono,fontSize:14,color:isUp?T.grn:T.red}}>{isUp?"+":""}{stock.change.toFixed(2)} ({isUp?"+":""}{stock.changePct.toFixed(2)}%)</span>
              </div>
              <div style={{fontFamily:T.mono,fontSize:10,color:T.faint,marginTop:4}}>{stock.hasRealData?L.dataAsOfLabel(stock.dataAsOf):`${stock.dataAsOf} · ${L.simData}`}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>onAddToPortfolio(stock)} style={{fontFamily:T.disp,fontSize:13,fontWeight:700,color:"#fff",background:T.acc,border:"none",borderRadius:8,padding:"10px 18px",cursor:"pointer",transition:"opacity .2s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                {L.addToPortfolio}
              </button>
              <button onClick={()=>setShowDeep(d=>!d)} style={{fontFamily:T.disp,fontSize:13,fontWeight:700,color:T.amb,background:T.ambD,border:`1px solid ${T.amb}40`,borderRadius:8,padding:"10px 18px",cursor:"pointer"}}>
                ⚡ {showDeep?L.hideAnalysis:L.deepAnalysis}
              </button>
            </div>
          </div>
          <div className="fu1" style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
            {[{l:L.marketCap,v:stock.marketCap},{l:L.peRatio,v:stock.pe},{l:L.pbRatio,v:stock.pb},{l:L.eps,v:`$${stock.eps}`},{l:L.divYield,v:`${stock.dividendYield}%`,c:stock.dividendYield>2?T.grn:T.text},{l:L.beta,v:stock.beta,c:stock.beta>1.5?T.red:stock.beta>1.2?T.amb:stock.beta<0.7?T.grn:T.text},{l:L.high52,v:`$${stock.high52w}`,c:T.grn},{l:L.low52,v:`$${stock.low52w}`,c:T.red}].map(s=>(
              <StatCard key={s.l} label={s.l} value={s.v} color={s.c} T={T}/>
            ))}
          </div>
          <div className="fu2" style={{marginBottom:20}}>
            <ReturnChart T={T} L={L} history={stock.history} title={`${stock.symbol} ${L.totalReturn}`} subtitle={stock.hasRealData?L.dataAsOfLabel(stock.dataAsOf):`${stock.dataAsOf} · ${L.simData}`} totalRet={stock.totalReturn} priceRet={stock.priceReturn}/>
          </div>
          <div className="fu3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
            <StatCard label={L.revenue} value={stock.revenue} T={T}/>
            <StatCard label={L.grossMargin} value={stock.grossMargin} color={T.grn} T={T}/>
            <StatCard label={L.roic} value={`${stock.roic}%`} color={T.acc} T={T}/>
          </div>
          {showDeep&&<DeepAnalysisPanel T={T} L={L} stock={stock}/>}
        </>
      )}
    </div>
  );
}

/* ═══════════ ADD TO PORTFOLIO MODAL ═══════════ */
function AddToPortfolioModal({T,L,stock,portfolios,onConfirm,onClose}){
  const [mode,setMode]=useState(portfolios.length===0?"new":"choose");
  const [newName,setNewName]=useState("");
  const [selected,setSelected]=useState([]);
  const inp={width:"100%",background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:8,padding:"10px 13px",fontFamily:T.mono,fontSize:13,color:T.text,outline:"none"};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:T.sur,border:`1px solid ${T.bdrM}`,borderRadius:16,padding:30,width:420,maxWidth:"90vw"}}>
        <h3 style={{fontFamily:T.disp,fontSize:19,fontWeight:700,color:T.text,marginBottom:4}}>{L.addToPort.replace("{sym}",stock.symbol)}</h3>
        <p style={{fontFamily:T.body,fontSize:13,color:T.dim,marginBottom:22}}>{L.equalWeights}</p>
        {portfolios.length>0&&(
          <div style={{display:"flex",gap:8,marginBottom:18}}>
            {["choose","new"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,fontFamily:T.mono,fontSize:12,padding:"8px",background:mode===m?T.accD:T.surB,color:mode===m?T.acc:T.dim,border:`1px solid ${mode===m?T.acc+"40":T.bdr}`,borderRadius:6,cursor:"pointer"}}>
                {m==="choose"?L.existingPort:L.newPort}
              </button>
            ))}
          </div>
        )}
        {mode==="new"?(
          <div style={{marginBottom:22}}>
            <label style={{fontFamily:T.mono,fontSize:10,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:7}}>{L.portName}</label>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder={L.portNamePlaceholder} style={inp}/>
          </div>
        ):(
          <div style={{marginBottom:22}}>
            {portfolios.map(p=>{
              const weights=computeNewWeights(p.holdings,stock.symbol);
              return(
                <div key={p.id} onClick={()=>setSelected(s=>s.includes(p.id)?s.filter(x=>x!==p.id):[...s,p.id])}
                  style={{padding:"10px 13px",marginBottom:6,borderRadius:8,cursor:"pointer",background:selected.includes(p.id)?T.accD:T.surB,border:`1px solid ${selected.includes(p.id)?T.acc+"40":T.bdr}`}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontFamily:T.body,fontSize:13,color:T.text}}>{p.name}</span>
                    <span style={{fontFamily:T.mono,fontSize:11,color:T.dim}}>{L.nHoldings?L.nHoldings(p.holdings.length):`${p.holdings.length} holdings`}</span>
                  </div>
                  {selected.includes(p.id)&&<div style={{fontFamily:T.mono,fontSize:11,color:T.grn,marginTop:5}}>→ {stock.symbol} {weights[stock.symbol]}%</div>}
                </div>
              );
            })}
          </div>
        )}
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,fontFamily:T.disp,fontSize:13,fontWeight:700,color:T.dim,background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:8,padding:"11px",cursor:"pointer"}}>{L.cancel}</button>
          <button disabled={mode==="new"?!newName:!selected.length} onClick={()=>onConfirm({mode,newName,selectedIds:selected})}
            style={{flex:2,fontFamily:T.disp,fontSize:13,fontWeight:700,color:"#fff",background:T.acc,border:"none",borderRadius:8,padding:"11px",cursor:"pointer",opacity:mode==="new"?(!newName?0.5:1):(!selected.length?0.5:1)}}>
            {L.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ PORTFOLIO SCREEN ═══════════ */
function PortfolioScreen({T,L,portfolio,setPortfolio,onBack,onTickerClick}){
  const analytics=useMemo(()=>computePortfolioAnalytics(portfolio.holdings),[portfolio]);
  const [showAddTicker,setShowAddTicker]=useState(false);
  const [addPreview,setAddPreview]=useState(null);
  const [showHealthTip,setShowHealthTip]=useState(false);
  const [editingName,setEditingName]=useState(false);
  const [tempName,setTempName]=useState(portfolio.name);
  const nameInputRef=useRef();

  useEffect(()=>{if(editingName&&nameInputRef.current)nameInputRef.current.focus();},[editingName]);
  const saveName=()=>{if(tempName.trim()){setPortfolio(p=>({...p,name:tempName.trim()}));}else{setTempName(portfolio.name);}setEditingName(false);};

  const handleApplyWeights=adj=>{const wMap={};adj.forEach(a=>wMap[a.symbol]=a.suggested);setPortfolio(p=>({...p,holdings:p.holdings.map(h=>({...h,weight:wMap[h.symbol]??h.weight}))}));};
  const handleAddTicker=ticker=>{if(portfolio.holdings.find(h=>h.symbol===ticker.symbol))return;const stockInfo=buildStockInfo(ticker);const newWeights=computeNewWeights(portfolio.holdings,ticker.symbol);setAddPreview({ticker,stockInfo,newWeights});setShowAddTicker(false);};
  const confirmAddTicker=()=>{if(!addPreview)return;setPortfolio(p=>({...p,holdings:[...p.holdings.map(h=>({...h,weight:addPreview.newWeights[h.symbol]??h.weight})),{symbol:addPreview.ticker.symbol,weight:addPreview.newWeights[addPreview.ticker.symbol],stockInfo:addPreview.stockInfo}]}));setAddPreview(null);};

  if(!portfolio.holdings.length)return(
    <div style={{maxWidth:960,margin:"0 auto",padding:"60px 22px",textAlign:"center"}}>
      <button onClick={onBack} style={{fontFamily:T.mono,fontSize:12,color:T.dim,background:"none",border:"none",cursor:"pointer",marginBottom:24,display:"block"}}>{L.back}</button>
      <div style={{fontFamily:T.body,color:T.dim}}>{L.noHoldings}</div>
    </div>
  );
  const healthColor=analytics?.healthScore>=75?T.grn:analytics?.healthScore>=55?T.amb:T.red;

  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:"30px 22px",paddingBottom:100}}>
      <button onClick={onBack} style={{fontFamily:T.mono,fontSize:12,color:T.dim,background:"none",border:"none",cursor:"pointer",marginBottom:22}}>{L.back}</button>
      <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          {editingName?(
            <input ref={nameInputRef} value={tempName} onChange={e=>setTempName(e.target.value)}
              onBlur={saveName} onKeyDown={e=>{if(e.key==="Enter")saveName();if(e.key==="Escape"){setTempName(portfolio.name);setEditingName(false);}}}
              style={{fontFamily:T.disp,fontSize:28,fontWeight:800,color:T.text,background:T.surB,border:`1px solid ${T.acc}50`,borderRadius:8,padding:"2px 10px",outline:"none",width:"100%",maxWidth:400}}/>
          ):(
            <div onClick={()=>{setTempName(portfolio.name);setEditingName(true);}} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8}} title={L.editName}>
              <h1 style={{fontFamily:T.disp,fontSize:28,fontWeight:800,color:T.text,marginBottom:3}}>{portfolio.name}</h1>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="2" style={{flexShrink:0}}><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </div>
          )}
          <div style={{fontFamily:T.mono,fontSize:12,color:T.dim}}>{L.portfolioOf(portfolio.holdings.length)}</div>
        </div>
        <button onClick={()=>setShowAddTicker(s=>!s)} style={{fontFamily:T.disp,fontSize:13,fontWeight:700,color:T.grn,background:T.grnD,border:`1px solid ${T.grn}40`,borderRadius:8,padding:"10px 18px",cursor:"pointer"}}>
          {showAddTicker?L.cancel:L.addTicker}
        </button>
      </div>

      {showAddTicker&&(
        <div className="fu" style={{background:T.sur,border:`1px solid ${T.grn}30`,borderRadius:12,padding:20,marginBottom:20,position:"relative",zIndex:500}}>
          <p style={{fontFamily:T.body,fontSize:13,color:T.dim,marginBottom:12}}>{L.searchToAddPrompt}</p>
          <TickerSearch T={T} onSelect={handleAddTicker} placeholder={L.searchToAdd}/>
        </div>
      )}
      {addPreview&&(
        <div className="fu" style={{background:T.sur,border:`1px solid ${T.grn}40`,borderRadius:12,padding:20,marginBottom:20}}>
          <h4 style={{fontFamily:T.disp,fontSize:14,fontWeight:700,color:T.grn,marginBottom:12}}>{L.addPreviewTitle(addPreview.ticker.symbol)}</h4>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
            {Object.entries(addPreview.newWeights).map(([sym,w])=>(
              <div key={sym} style={{background:sym===addPreview.ticker.symbol?T.grnD:T.surB,border:`1px solid ${sym===addPreview.ticker.symbol?T.grn+"40":T.bdr}`,borderRadius:7,padding:"8px 14px",textAlign:"center"}}>
                <div style={{fontFamily:T.mono,fontSize:11,fontWeight:600,color:sym===addPreview.ticker.symbol?T.grn:T.acc}}>{sym}</div>
                <div style={{fontFamily:T.mono,fontSize:14,fontWeight:600,color:T.text}}>{w}%</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={confirmAddTicker} style={{fontFamily:T.disp,fontSize:13,fontWeight:700,color:"#fff",background:T.grn,border:"none",borderRadius:8,padding:"10px 22px",cursor:"pointer"}}>{L.confirmAdd}</button>
            <button onClick={()=>setAddPreview(null)} style={{fontFamily:T.disp,fontSize:13,fontWeight:700,color:T.dim,background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:8,padding:"10px 22px",cursor:"pointer"}}>{L.cancel}</button>
          </div>
        </div>
      )}

      {analytics&&(
        <>
          <div className="fu1" style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:22}}>
            <StatCard label={`${L.totalReturn} (10Y)`} value={`+${analytics.totalRet}%`} color={T.grn} glow T={T}/>
            <StatCard label={L.priceAppreciationLabel} value={`+${analytics.priceRet}%`} color={T.acc} T={T}/>
            <StatCard label={L.dividendIncome} value={`+${analytics.incomeRet}%`} color={T.dim} sub={L.ofInitial} T={T}/>
            <StatCard label={L.sharpeRatio} value={analytics.sharpe} color={parseFloat(analytics.sharpe)>1?T.grn:parseFloat(analytics.sharpe)>0.5?T.amb:T.red} T={T}/>
            <StatCard label={L.portfolioBeta} value={analytics.wBeta} color={parseFloat(analytics.wBeta)>1.3?T.amb:T.grn} T={T}/>
            {/* Health Score with hover tooltip */}
            <div style={{position:"relative",flex:1,minWidth:110}}>
              <div
                style={{background:T.sur,border:`1px solid ${healthColor}60`,borderRadius:10,padding:"14px 18px",height:"100%",boxShadow:`0 0 22px ${healthColor}18`,cursor:"help"}}
                onMouseEnter={()=>setShowHealthTip(true)}
                onMouseLeave={()=>setShowHealthTip(false)}>
                <div style={{fontFamily:T.body,fontSize:11,color:T.dim,marginBottom:5,letterSpacing:"0.05em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:5}}>
                  {L.healthScore} <span style={{fontSize:10,color:T.faint}}>ⓘ</span>
                </div>
                <div style={{fontFamily:T.mono,fontSize:20,fontWeight:600,color:healthColor}}>{analytics.healthScore}<span style={{fontSize:12,color:T.dim}}>/100</span></div>
                <div style={{fontFamily:T.mono,fontSize:11,color:T.dim,marginTop:3}}>{analytics.healthScore>=75?L.strong:analytics.healthScore>=55?L.moderate:L.needsAttention}</div>
              </div>
              {showHealthTip&&(
                <div style={{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",zIndex:400,background:T.surB,border:`1px solid ${T.bdrM}`,borderRadius:10,padding:"12px 14px",width:260,boxShadow:`0 8px 24px ${T.shadow}`}}>
                  <div style={{fontFamily:T.disp,fontSize:12,fontWeight:700,color:T.amb,marginBottom:8}}>{L.healthCalcTitle}</div>
                  <div style={{fontFamily:T.body,fontSize:11,color:T.text,lineHeight:1.6,whiteSpace:"pre-line"}}>{L.healthTooltip}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:10}}>
                    {[{l:L.healthSharpe,w:"60%",c:T.acc},{l:L.healthBeta,w:"20%",c:T.grn},{l:L.healthDiversification,w:"20%",c:T.vio}].map(item=>(
                      <div key={item.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontFamily:T.mono,fontSize:10,color:T.dim}}>{item.l}</span>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:40,height:4,background:T.bdr,borderRadius:2,overflow:"hidden"}}>
                            <div style={{width:item.w,height:"100%",background:item.c,borderRadius:2}}/>
                          </div>
                          <span style={{fontFamily:T.mono,fontSize:10,color:item.c,width:28}}>{item.w}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontFamily:T.mono,fontSize:10,color:T.faint,marginTop:6}}>{L.healthYourScore(analytics.healthScore,analytics.sharpe,analytics.wBeta)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="fu2" style={{marginBottom:20}}>
            <ReturnChart T={T} L={L} history={analytics.combined} title={L.portfolioTotalReturn} subtitle={L.portfolioSubtitle} totalRet={analytics.totalRet} priceRet={analytics.priceRet}/>
          </div>

          <div className="fu3" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:20}}>
            <div style={{background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:14,padding:22}}>
              <h3 style={{fontFamily:T.disp,fontSize:15,fontWeight:700,color:T.text,marginBottom:14}}>{L.holdings}</h3>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1.2fr",padding:"0 8px 8px",borderBottom:`1px solid ${T.bdr}`}}>
                {[L.holdings.slice(0,6),L.weight,L.price,L.return].map(h=><span key={h} style={{fontFamily:T.mono,fontSize:9,color:T.faint,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</span>)}
              </div>
              {portfolio.holdings.map(h=>{const ret=parseFloat(h.stockInfo.totalReturn);return(
                <div key={h.symbol} onClick={()=>onTickerClick(h.stockInfo)} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1.2fr",padding:"8px 8px",borderRadius:6,cursor:"pointer",transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.accD} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div><span style={{fontFamily:T.mono,fontSize:13,fontWeight:600,color:T.acc}}>{h.symbol}</span><div style={{fontFamily:T.body,fontSize:10,color:T.dim}}>{h.stockInfo.sector}</div></div>
                  <span style={{fontFamily:T.mono,fontSize:12,color:T.text,alignSelf:"center"}}>{h.weight.toFixed(1)}%</span>
                  <span style={{fontFamily:T.mono,fontSize:12,color:T.dim,alignSelf:"center"}}>${h.stockInfo.price.toFixed(0)}</span>
                  <span style={{fontFamily:T.mono,fontSize:12,color:ret>0?T.grn:T.red,alignSelf:"center"}}>{ret>0?"+":""}{ret}%</span>
                </div>
              );})}
            </div>
            <div style={{background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:14,padding:22}}>
              <h3 style={{fontFamily:T.disp,fontSize:15,fontWeight:700,color:T.text,marginBottom:3}}>{L.maxSharpeWeights}</h3>
              <p style={{fontFamily:T.body,fontSize:12,color:T.dim,marginBottom:14}}>{L.maxSharpeDesc}</p>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"0 8px 8px",borderBottom:`1px solid ${T.bdr}`}}>
                {[L.ticker,L.current,L.optimal,"Δ"].map(h=><span key={h} style={{fontFamily:T.mono,fontSize:9,color:T.faint,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</span>)}
              </div>
              {analytics.suggested.map(w=>{const delta=(w.suggested-w.current).toFixed(1);const up=parseFloat(delta)>0;return(
                <div key={w.symbol} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"8px 8px"}}>
                  <span style={{fontFamily:T.mono,fontSize:13,fontWeight:600,color:T.acc}}>{w.symbol}</span>
                  <span style={{fontFamily:T.mono,fontSize:12,color:T.dim}}>{w.current.toFixed(1)}%</span>
                  <span style={{fontFamily:T.mono,fontSize:12,color:T.text}}>{w.suggested.toFixed(1)}%</span>
                  <span style={{fontFamily:T.mono,fontSize:12,color:up?T.grn:T.red}}>{up?"↑":"↓"}{Math.abs(parseFloat(delta))}%</span>
                </div>
              );})}
            </div>
          </div>

          <EfficientFrontierPanel T={T} L={L} holdings={portfolio.holdings}/>

          <div style={{background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:14,padding:22,marginBottom:20}}>
            <h3 style={{fontFamily:T.disp,fontSize:15,fontWeight:700,color:T.text,marginBottom:14}}>{L.sectorConcentration}</h3>
            <ResponsiveContainer width="100%" height={Math.max(80,analytics.sectors.length*38)}>
              <BarChart data={analytics.sectors} layout="vertical" margin={{top:0,right:60,bottom:0,left:110}}>
                <CartesianGrid stroke={T.bdr} strokeDasharray="3 3" horizontal={false}/>
                <XAxis type="number" tick={{fontFamily:T.mono,fontSize:10,fill:T.dim}} tickLine={false} tickFormatter={v=>`${v}%`}/>
                <YAxis type="category" dataKey="sector" tick={{fontFamily:T.body,fontSize:12,fill:T.dim}} tickLine={false} axisLine={false} width={110}/>
                <Tooltip content={<TTip/>}/>
                <Bar dataKey="pct" radius={[0,4,4,0]} name="Weight %">
                  {analytics.sectors.map((_,i)=><Cell key={i} fill={[T.acc,T.vio,T.grn,T.amb,T.red,T.teal,T.dim][i%7]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      <AIChatPanel T={T} L={L} holdings={portfolio.holdings} onApplyWeights={handleApplyWeights}/>
    </div>
  );
}

/* ═══════════ APP ROOT ═══════════ */
let nextId=1;
export default function App(){
  useEffect(injectFonts,[]);
  const [themeKey,setThemeKey]=useState("dark");
  const [lang,setLang]=useState("en");
  const T=themeKey==="light"?LIGHT:DARK;
  const L=STRINGS[lang];
  const [realDataCache,setRealDataCache]=useState({});
  const [fetchingTicker,setFetchingTicker]=useState(false);
  const [fetchStatus,setFetchStatus]=useState("");

  // Sync theme to body for TTip
  useEffect(()=>{document.body.dataset.theme=themeKey;document.body.style.background=T.bg;},[themeKey,T.bg]);

  const [view,setView]=useState("home");
  const [portfolios,setPortfolios]=useState([]);
  const [selTicker,setSelTicker]=useState(null);
  const [selPortfolio,setSelPortfolio]=useState(null);
  const [addModal,setAddModal]=useState(null);

  const handleTickerSelect=async(t)=>{
    // If cached, show immediately
    if(realDataCache[t.symbol]){
      setSelTicker(buildStockInfo(t,realDataCache[t.symbol]));
      setView("ticker");
      return;
    }
    // Show loading state
    setSelTicker(null);
    setFetchStatus("");
    setView("ticker");
    try{
      const map=await fetchRealStockData([t.symbol],msg=>setFetchStatus(msg));
      const yd=map?.[t.symbol];
      if(yd){
        setRealDataCache(c=>({...c,[t.symbol]:yd}));
        setSelTicker(buildStockInfo(t,yd));
        setFetchStatus("");
      }else{
        setFetchStatus(`Failed to fetch data for ${t.symbol}. Using fallback data.`);
        setSelTicker(buildStockInfo(t));
      }
    }catch(e){
      console.error(e);
      setFetchStatus(`Error: ${e.message}. Using fallback data.`);
      setSelTicker(buildStockInfo(t));
    }
  };

  const updatePortfolio=updater=>{
    setPortfolios(ps=>ps.map(p=>p.id===selPortfolio?.id?updater(p):p));
    setSelPortfolio(p=>updater(p));
  };
  const handleConfirmAdd=({mode,newName,selectedIds})=>{
    if(mode==="new"){
      const stockInfo=buildStockInfo(addModal,realDataCache[addModal.symbol]);
      const p={id:nextId++,name:newName,holdings:[{symbol:addModal.symbol,weight:100,stockInfo}]};
      setPortfolios(ps=>[...ps,p]);setSelPortfolio(p);setView("portfolio");
    }else{
      setPortfolios(ps=>ps.map(p=>{
        if(!selectedIds.includes(p.id))return p;
        if(p.holdings.find(h=>h.symbol===addModal.symbol))return p;
        const stockInfo=buildStockInfo(addModal,realDataCache[addModal.symbol]);
        const newWeights=computeNewWeights(p.holdings,addModal.symbol);
        const holdings=[...p.holdings.map(h=>({...h,weight:newWeights[h.symbol]??h.weight})),{symbol:addModal.symbol,weight:newWeights[addModal.symbol],stockInfo}];
        return{...p,holdings};
      }));
    }
    setAddModal(null);
  };
  const handleCreatePortfolio=async(tickers)=>{
    if(!tickers||tickers.length===0)return;
    const name=`${lang==="zh"?"组合":"Portfolio"} ${portfolios.length+1}`;
    const n=tickers.length;
    // Fetch real data for all tickers in batch
    setFetchingTicker(true);
    setFetchStatus("");
    try{
      const syms=tickers.map(t=>t.symbol);
      const map=await fetchRealStockData(syms,msg=>setFetchStatus(msg));
      if(map&&Object.keys(map).length>0){
        setRealDataCache(c=>({...c,...map}));
        const holdings=tickers.map((t,i)=>({symbol:t.symbol,weight:i===n-1?+(100-Math.floor(100/n)*(n-1)).toFixed(1):+Math.floor(100/n).toFixed(1),stockInfo:buildStockInfo(t,map[t.symbol])}));
        const p={id:nextId++,name,holdings};
        setPortfolios(ps=>[...ps,p]);setSelPortfolio(p);setView("portfolio");
        setFetchingTicker(false);
        return;
      }
    }catch(e){console.error(e);}
    setFetchingTicker(false);
    // Fallback to simulated
    const holdings=tickers.map((t,i)=>({symbol:t.symbol,weight:i===n-1?+(100-Math.floor(100/n)*(n-1)).toFixed(1):+Math.floor(100/n).toFixed(1),stockInfo:buildStockInfo(t)}));
    const p={id:nextId++,name,holdings};
    setPortfolios(ps=>[...ps,p]);setSelPortfolio(p);setView("portfolio");
  };

  // scrollbar color based on theme
  const scrollCss=themeKey==="light"?"::-webkit-scrollbar-track{background:#f0f4ff}::-webkit-scrollbar-thumb{background:#b8caf0;border-radius:3px}":"::-webkit-scrollbar-track{background:#0f1a2e}::-webkit-scrollbar-thumb{background:#2a3f63;border-radius:3px}";

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.body,color:T.text}}>
      <style>{scrollCss}</style>
      <nav style={{position:"sticky",top:0,zIndex:50,background:`${T.bg}f0`,backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.bdr}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 26px",height:54}}>
        <button onClick={()=>setView("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,borderRadius:7,background:T.accD,border:`1px solid ${T.acc}30`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <span style={{fontFamily:T.disp,fontSize:15,fontWeight:800,color:T.text,letterSpacing:"-0.01em"}}>PortfolioLens</span>
        </button>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {portfolios.length>0&&(
            <button onClick={()=>setView("portfolios")} style={{fontFamily:T.mono,fontSize:11,color:view==="portfolios"?T.acc:T.dim,background:view==="portfolios"?T.accD:"none",border:`1px solid ${view==="portfolios"?T.acc+"30":"transparent"}`,borderRadius:6,padding:"5px 13px",cursor:"pointer"}}>
              {lang==="zh"?"组合":"Portfolios"} ({portfolios.length})
            </button>
          )}
          <TickerSearch T={T} onSelect={t=>handleTickerSelect(t)} compact placeholder={lang==="zh"?"快速搜索...":"Quick search..."}/>
          {/* Language toggle */}
          <div style={{display:"flex",background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:7,overflow:"hidden"}}>
            {["en","zh"].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{fontFamily:T.mono,fontSize:11,padding:"5px 10px",cursor:"pointer",background:lang===l?T.accD:"transparent",color:lang===l?T.acc:T.dim,border:"none",borderRight:l==="en"?`1px solid ${T.bdr}`:"none",transition:"all .15s"}}>
                {l==="en"?"EN":"中文"}
              </button>
            ))}
          </div>
          {/* Theme toggle */}
          <button onClick={()=>setThemeKey(k=>k==="dark"?"light":"dark")} title={themeKey==="dark"?"Switch to Light":"Switch to Dark"}
            style={{background:T.surB,border:`1px solid ${T.bdr}`,borderRadius:7,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.dim,fontSize:16,transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=T.acc}
            onMouseLeave={e=>e.currentTarget.style.borderColor=T.bdr}>
            {themeKey==="dark"?"☀":"🌙"}
          </button>
        </div>
      </nav>

      {view==="home"&&<HomeScreen T={T} L={L} onTickerSelect={handleTickerSelect} portfolios={portfolios} onViewPortfolios={p=>{if(p&&p.id){setSelPortfolio(p);setView("portfolio");}else setView("portfolios");}} onCreatePortfolio={handleCreatePortfolio}/>}
      {view==="ticker"&&!selTicker&&(
        <div style={{maxWidth:960,margin:"0 auto",padding:"80px 22px",textAlign:"center"}}>
          <div style={{width:44,height:44,border:`3px solid ${T.bdr}`,borderTop:`3px solid ${T.acc}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 20px"}}/>
          <p style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:T.text,marginBottom:8}}>{L.fetchingData}</p>
          {fetchStatus&&<p style={{fontFamily:T.mono,fontSize:11,color:T.dim,maxWidth:500,margin:"0 auto",lineHeight:1.6,wordBreak:"break-word"}}>{fetchStatus}</p>}
        </div>
      )}
      {view==="ticker"&&selTicker&&<TickerScreen T={T} L={L} stock={selTicker} portfolios={portfolios} onAddToPortfolio={s=>setAddModal(s)} onBack={()=>setView("home")} onNavigateTicker={s=>setSelTicker(s)}/>}
      {view==="portfolios"&&(
        <div style={{maxWidth:960,margin:"0 auto",padding:"38px 22px"}}>
          <h2 style={{fontFamily:T.disp,fontSize:24,fontWeight:800,color:T.text,marginBottom:22}}>{L.yourPortfoliosTitle}</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
            {portfolios.map(p=>(
              <div key={p.id} onClick={()=>{setSelPortfolio(p);setView("portfolio");}} style={{background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:13,padding:22,cursor:"pointer",transition:"border-color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.acc} onMouseLeave={e=>e.currentTarget.style.borderColor=T.bdr}>
                <h3 style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:T.text,marginBottom:8}}>{p.name}</h3>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{p.holdings.map(h=><Badge key={h.symbol} color={T.acc} T={T}>{h.symbol}</Badge>)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {view==="portfolio"&&selPortfolio&&(
        <PortfolioScreen T={T} L={L} portfolio={selPortfolio} setPortfolio={updatePortfolio} onBack={()=>setView("portfolios")} onTickerClick={s=>{setSelTicker(s);setView("ticker");}}/>
      )}
      {addModal&&<AddToPortfolioModal T={T} L={L} stock={addModal} portfolios={portfolios} onConfirm={handleConfirmAdd} onClose={()=>setAddModal(null)}/>}
      {fetchingTicker&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(4px)"}}>
          <div style={{background:T.sur,border:`1px solid ${T.bdr}`,borderRadius:16,padding:"40px 50px",textAlign:"center",maxWidth:420}}>
            <div style={{width:44,height:44,border:`3px solid ${T.bdr}`,borderTop:`3px solid ${T.acc}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 18px"}}/>
            <p style={{fontFamily:T.disp,fontSize:15,fontWeight:700,color:T.text,marginBottom:8}}>{L.fetchingData}</p>
            {fetchStatus&&<p style={{fontFamily:T.mono,fontSize:11,color:T.dim,lineHeight:1.6,wordBreak:"break-word"}}>{fetchStatus}</p>}
          </div>
        </div>
      )}
      <FeedbackWidget T={T} L={L}/>
    </div>
  );
}
