(function (root) {
  'use strict';
  const assumptions = Object.freeze({
    eurCny: 7.466, packUnits: 10, unitGrams: 32, operatingDays: 360,
    factoryPrice: 1.20, retailFactoryPrice: 1.10, variableCost: 0.70,
    retailTradeProvision: 0.10, baseCampaign: 20000,
    retailPriceCny: 198, vatAssumption: 0.13,
    giftBoxCny: 6, freightAndImportProvisionCny: 20,
    channelVariableShare: 0.10, deliveryCny: 10, returnsProvisionCny: 4
  });
  const defaults = Object.freeze({ stores: 20, storePacksPerDay: 1, hotels: 4,
    unitsPerDay: 10, onlineBoxes: 800, guest: 5000, entryCost: 5000 });
  function equivalentMonths(months) {
    return Math.max(0, Math.min(months - 3, 3)) * 0.5 + Math.max(0, months - 6);
  }
  function payback(investment, annualContribution) {
    if (investment <= 0) return 0;
    if (annualContribution <= 0) return null;
    const fullMonths = investment / (annualContribution / 12);
    return fullMonths <= 1.5 ? 3 + fullMonths / 0.5 : 6 + fullMonths - 1.5;
  }
  function calculate(input = {}) {
    const a = assumptions;
    const v = { ...defaults, ...input };
    const retailUnits = v.stores * v.storePacksPerDay * a.packUnits * a.operatingDays;
    const hotelUnits = v.hotels * v.unitsPerDay * a.operatingDays;
    const onlineUnits = v.onlineBoxes * a.packUnits;
    const annualUnits = retailUnits + hotelUnits + onlineUnits;
    const unitContribution = a.factoryPrice - a.variableCost;
    const retailUnitContribution = a.retailFactoryPrice - a.variableCost - a.retailTradeProvision;
    const retailContribution = retailUnits * retailUnitContribution;
    const hotelContribution = hotelUnits * unitContribution;
    const onlineContribution = onlineUnits * unitContribution;
    const contribution = retailContribution + hotelContribution + onlineContribution;
    const campaign = a.baseCampaign + v.guest;
    const investment = campaign + v.entryCost;
    const firstYearFactor = equivalentMonths(12) / 12;
    const firstYearContribution = contribution * firstYearFactor;
    const perStoreContribution = v.storePacksPerDay * a.packUnits * a.operatingDays * retailUnitContribution;
    const missingContribution = Math.max(0, investment / firstYearFactor - hotelContribution - onlineContribution);
    const requiredStores12 = perStoreContribution > 0 ? Math.ceil(missingContribution / perStoreContribution - 1e-9) : missingContribution > 0 ? null : 0;
    return {
      retailUnits, hotelUnits, onlineUnits, annualUnits, unitContribution, retailUnitContribution,
      retailContribution, hotelContribution, onlineContribution, contribution, campaign, investment,
      factoryRevenue: retailUnits * a.retailFactoryPrice + (hotelUnits + onlineUnits) * a.factoryPrice,
      tradeProvision: retailUnits * a.retailTradeProvision,
      firstYearUnits: annualUnits * firstYearFactor, firstYearContribution,
      afterInvestmentFirstYear: firstYearContribution - investment,
      campaignPaybackMonths: payback(campaign, contribution),
      paybackMonths: payback(investment, contribution), requiredStores12,
      higherCostPaybackMonths: payback(investment, contribution - annualUnits * 0.10)
    };
  }
  function retail(priceCny = assumptions.retailPriceCny) {
    const a = assumptions;
    const factory = a.factoryPrice * a.packUnits * a.eurCny;
    const landed = factory + a.giftBoxCny + a.freightAndImportProvisionCny;
    const netSales = priceCny / (1 + a.vatAssumption);
    const vat = priceCny - netSales;
    const channel = priceCny * a.channelVariableShare;
    const contribution = netSales - landed - channel - a.deliveryCny - a.returnsProvisionCny;
    return { priceCny, factory, landed, netSales, vat, channel, contribution };
  }
  root.CasaAlbaEconomics = Object.freeze({ assumptions, defaults, calculate, retail, equivalentMonths, payback });
})(globalThis);
