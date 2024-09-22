export function calculateProfit(purchase) {
  const totalCost = purchase.price;
  const totalRevenue = purchase.items.reduce((sum, item) => {
    return sum + (item.status === 'Sold' ? item.soldFor : 0);
  }, 0);
  const profit = totalRevenue - totalCost;
  console.log(`Calculating profit for ${purchase.name}: Revenue ${totalRevenue} - Cost ${totalCost} = Profit ${profit}`);
  return profit;
}

