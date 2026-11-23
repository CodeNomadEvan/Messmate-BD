function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function calculateMealRate(foodExpense, totalMeals) {
  if (!totalMeals || totalMeals <= 0) return 0;
  return Number(foodExpense || 0) / totalMeals;
}

function allocateUtilityShares(totalUtility, memberCount) {
  if (!memberCount || memberCount <= 0) return [];

  const totalCents = Math.round(Number(totalUtility || 0) * 100);
  const baseCents = Math.floor(totalCents / memberCount);
  const remainingCents = totalCents % memberCount;

  return Array.from({ length: memberCount }, (_, index) =>
    (baseCents + (index < remainingCents ? 1 : 0)) / 100
  );
}

function calculateMemberBalance({ memberMealCount, guestMealCount, mealRate, utilityShare, totalPaid }) {
  const mealCount = Number(memberMealCount || 0) + Number(guestMealCount || 0);
  const mealCost = roundMoney(mealCount * Number(mealRate || 0));
  const sharedUtilityCost = roundMoney(utilityShare);
  const totalCost = roundMoney(mealCost + sharedUtilityCost);
  const paid = roundMoney(totalPaid);
  const due = roundMoney(Math.max(0, totalCost - paid));
  const advance = roundMoney(Math.max(0, paid - totalCost));

  return {
    mealCount,
    mealCost,
    utilityShare: sharedUtilityCost,
    totalCost,
    totalPaid: paid,
    due,
    advance,
    paymentStatus: due > 0 ? "Due" : advance > 0 ? "Advance" : "Paid",
  };
}

module.exports = { roundMoney, calculateMealRate, allocateUtilityShares, calculateMemberBalance };
