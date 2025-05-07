import { LoanParameters } from '@/app/types/loan';

/**
 * Calculate loan amount and own contribution based on purchase price
 * @param purchasePrice The purchase price of the property
 * @param ownContributionPercentage Percentage of the purchase price to be paid as own contribution (default: 10%)
 * @returns Object containing the calculated loan amount and own contribution
 */
export function calculateLoanValues(
  purchasePrice: number, 
  ownContributionPercentage: number = 10
): { principal: number; ownContribution: number } {
  // Ensure the percentage is between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, ownContributionPercentage));
  
  // Calculate own contribution (percentage of purchase price)
  const ownContribution = (purchasePrice * clampedPercentage) / 100;
  
  // Calculate principal (purchase price minus own contribution)
  const principal = purchasePrice - ownContribution;
  
  return { principal, ownContribution };
}

/**
 * Update loan parameters based on a new purchase price
 * @param params The current loan parameters
 * @param newPurchasePrice The new purchase price
 * @param preserveOwnContributionPercentage Whether to maintain the same own contribution percentage (default: true)
 * @returns Updated loan parameters
 */
export function updateLoanWithPurchasePrice(
  params: LoanParameters,
  newPurchasePrice: number,
  preserveOwnContributionPercentage: boolean = true
): LoanParameters {
  if (preserveOwnContributionPercentage && params.purchasePrice) {
    // Calculate current own contribution percentage
    const currentOwnContributionPercentage = (params.ownContribution / params.purchasePrice) * 100;
    
    // Calculate new values based on the same percentage
    const { principal, ownContribution } = calculateLoanValues(newPurchasePrice, currentOwnContributionPercentage);
    
    return {
      ...params,
      principal,
      ownContribution,
      purchasePrice: newPurchasePrice
    };
  } else {
    // Default to 10% own contribution for the new purchase price
    const { principal, ownContribution } = calculateLoanValues(newPurchasePrice);
    
    return {
      ...params,
      principal,
      ownContribution,
      purchasePrice: newPurchasePrice
    };
  }
}
