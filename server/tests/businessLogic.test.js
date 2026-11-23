const test = require("node:test");
const assert = require("node:assert/strict");
const { isValidDate, isValidDateRange, daysBetween } = require("../utils/date");
const { calculateMealRate, allocateUtilityShares, calculateMemberBalance } = require("../utils/finance");

test("date validation rejects impossible dates and accepts leap day", () => {
  assert.equal(isValidDate("2028-02-29"), true);
  assert.equal(isValidDate("2027-02-29"), false);
  assert.equal(isValidDate("2027-13-01"), false);
});

test("date range validation and day counting are inclusive", () => {
  assert.equal(isValidDateRange("2027-01-30", "2027-02-02"), true);
  assert.equal(isValidDateRange("2027-02-02", "2027-01-30"), false);
  assert.equal(daysBetween("2027-01-30", "2027-02-02"), 4);
});

test("meal rate uses bazar expense and all meal units", () => {
  assert.equal(calculateMealRate(1200, 40), 30);
  assert.equal(calculateMealRate(1200, 0), 0);
  assert.equal(calculateMealRate(100, 3), 100 / 3);
});

test("utility allocation distributes every paisa without losing rounding remainder", () => {
  const shares = allocateUtilityShares(100, 3);
  assert.deepEqual(shares, [33.34, 33.33, 33.33]);
  assert.equal(Number(shares.reduce((sum, value) => sum + value, 0).toFixed(2)), 100);
});

test("hosted guest meals are included in the host member cost and due", () => {
  const result = calculateMemberBalance({
    memberMealCount: 10,
    guestMealCount: 2,
    mealRate: 30,
    utilityShare: 50,
    totalPaid: 300,
  });
  assert.deepEqual(result, {
    mealCount: 12,
    mealCost: 360,
    utilityShare: 50,
    totalCost: 410,
    totalPaid: 300,
    due: 110,
    advance: 0,
    paymentStatus: "Due",
  });
});

test("overpayment is shown as advance rather than a negative due", () => {
  const result = calculateMemberBalance({
    memberMealCount: 2,
    guestMealCount: 0,
    mealRate: 25,
    utilityShare: 10,
    totalPaid: 100,
  });
  assert.equal(result.due, 0);
  assert.equal(result.advance, 40);
  assert.equal(result.paymentStatus, "Advance");
});
