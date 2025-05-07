"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '../../i18n/client';

type PricingPeriod = 'monthly' | 'annual';
type AdPlanType = 'standard' | 'premium' | 'enterprise';

export default function PricingPage() {
  const { t } = useTranslation();
  const [pricingPeriod, setPricingPeriod] = useState<PricingPeriod>('annual');
  const [adPlanType, setAdPlanType] = useState<AdPlanType>('standard');

  const getPrice = (basePrice: number): string => {
    const discount = pricingPeriod === 'annual' ? 0.2 : 0; // 20% discount for annual
    const finalPrice = basePrice * (1 - discount);
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(finalPrice);
  };

  const togglePricingPeriod = () => {
    setPricingPeriod(pricingPeriod === 'monthly' ? 'annual' : 'monthly');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            {t('pricing.title', 'Flexible Plans for Every Need')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pricing.subtitle', 'Choose the perfect plan to help you visualize, compare, and optimize your loan decisions.')}
          </p>
        </div>

        {/* Pricing Period Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-white rounded-full p-1 shadow-md flex">
            <button 
              className={`py-2 px-6 rounded-full text-sm font-medium transition-colors ${pricingPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setPricingPeriod('monthly')}
            >
              {t('pricing.monthly', 'Monthly')}
            </button>
            <button 
              className={`py-2 px-6 rounded-full text-sm font-medium transition-colors ${pricingPeriod === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setPricingPeriod('annual')}
            >
              {t('pricing.annual', 'Annual')} 
              <span className="ml-1 text-xs font-bold bg-green-100 text-green-800 py-0.5 px-1.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* User Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Free Plan */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {t('pricing.freePlan.name', 'Basic')}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">
                  {t('pricing.freePlan.price', '€0')}
                </span>
                <span className="text-gray-500 ml-2">
                  {t('pricing.forever', 'forever')}
                </span>
              </div>
              <p className="text-gray-600 mb-8">
                {t('pricing.freePlan.description', 'Perfect for individual users looking to explore loan options.')}
              </p>
              <Link
                href="/auth/register"
                className="block w-full py-3 px-6 text-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition duration-300"
              >
                {t('pricing.freePlan.button', 'Get Started')}
              </Link>
            </div>
            <div className="bg-gray-50 px-8 py-6">
              <h4 className="font-medium text-gray-800 mb-4">
                {t('pricing.includes', 'Includes:')}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.freePlan.feature1', 'Basic loan calculation')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.freePlan.feature2', 'Standard visualization')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.freePlan.feature3', 'Save up to 3 calculations')}</span>
                </li>
                <li className="flex items-start text-gray-400">
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>{t('pricing.freePlan.featureUnavailable1', 'Advanced comparisons')}</span>
                </li>
                <li className="flex items-start text-gray-400">
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>{t('pricing.freePlan.featureUnavailable2', 'Investment simulations')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden transform scale-105 border-2 border-blue-500 relative transition-transform duration-300 hover:scale-110">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg font-semibold text-sm">
              {t('pricing.popularLabel', 'MOST POPULAR')}
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {t('pricing.proPlan.name', 'Pro')}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">
                  {getPrice(9.99)}
                </span>
                <span className="text-gray-500 ml-2">
                  /{pricingPeriod === 'monthly' ? t('pricing.month', 'month') : t('pricing.year', 'year')}
                </span>
              </div>
              <p className="text-gray-600 mb-8">
                {t('pricing.proPlan.description', 'For homebuyers and professionals who need advanced features.')}
              </p>
              <Link
                href="/auth/register?plan=pro"
                className="block w-full py-3 px-6 text-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-300"
              >
                {t('pricing.proPlan.button', 'Go Pro')}
              </Link>
            </div>
            <div className="bg-gray-50 px-8 py-6">
              <h4 className="font-medium text-gray-800 mb-4">
                {t('pricing.includes', 'Includes:')}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.proPlan.feature1', 'Everything in Basic')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.proPlan.feature2', 'Unlimited saved calculations')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.proPlan.feature3', 'Advanced loan comparison')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.proPlan.feature4', 'Investment simulation')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.proPlan.feature5', 'Export to PDF/CSV')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {t('pricing.enterprisePlan.name', 'Enterprise')}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">
                  {getPrice(24.99)}
                </span>
                <span className="text-gray-500 ml-2">
                  /{pricingPeriod === 'monthly' ? t('pricing.month', 'month') : t('pricing.year', 'year')}
                </span>
              </div>
              <p className="text-gray-600 mb-8">
                {t('pricing.enterprisePlan.description', 'For financial advisors and mortgage brokers managing multiple clients.')}
              </p>
              <Link
                href="/auth/register?plan=enterprise"
                className="block w-full py-3 px-6 text-center rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-semibold transition duration-300"
              >
                {t('pricing.enterprisePlan.button', 'Contact Sales')}
              </Link>
            </div>
            <div className="bg-gray-50 px-8 py-6">
              <h4 className="font-medium text-gray-800 mb-4">
                {t('pricing.includes', 'Includes:')}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.enterprisePlan.feature1', 'Everything in Pro')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.enterprisePlan.feature2', 'Multi-client management')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.enterprisePlan.feature3', 'Client portal')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.enterprisePlan.feature4', 'Advanced insurance approximation')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-600">{t('pricing.enterprisePlan.feature5', 'White-labeling options')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Targeted Ad Plans Section */}
        <div className="mt-24 mb-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
              {t('pricing.adPlans.title', 'For Banks & Mortgage Brokers')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('pricing.adPlans.subtitle', 'Connect with potential clients through targeted advertising on our platform.')}
            </p>
          </div>

          {/* Ad Plan Type Toggle */}
          <div className="flex justify-center mb-16">
            <div className="bg-white rounded-full p-1 shadow-md flex">
              <button 
                className={`py-2 px-6 rounded-full text-sm font-medium transition-colors ${adPlanType === 'standard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setAdPlanType('standard')}
              >
                {t('pricing.adPlans.standard', 'Standard')}
              </button>
              <button 
                className={`py-2 px-6 rounded-full text-sm font-medium transition-colors ${adPlanType === 'premium' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setAdPlanType('premium')}
              >
                {t('pricing.adPlans.premium', 'Premium')}
              </button>
              <button 
                className={`py-2 px-6 rounded-full text-sm font-medium transition-colors ${adPlanType === 'enterprise' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setAdPlanType('enterprise')}
              >
                {t('pricing.adPlans.enterprise', 'Enterprise')}
              </button>
            </div>
          </div>

          {/* Ad Plan Features */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {adPlanType === 'standard' && t('pricing.adPlans.standardTitle', 'Standard Advertising')}
                    {adPlanType === 'premium' && t('pricing.adPlans.premiumTitle', 'Premium Advertising')}
                    {adPlanType === 'enterprise' && t('pricing.adPlans.enterpriseTitle', 'Enterprise Advertising')}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-800">
                      {adPlanType === 'standard' && getPrice(299)}
                      {adPlanType === 'premium' && getPrice(599)}
                      {adPlanType === 'enterprise' && t('pricing.adPlans.enterprisePrice', 'Custom')}
                    </span>
                    {adPlanType !== 'enterprise' && (
                      <span className="text-gray-500 ml-2">
                        /{pricingPeriod === 'monthly' ? t('pricing.month', 'month') : t('pricing.year', 'year')}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-8">
                    {adPlanType === 'standard' && t('pricing.adPlans.standardDescription', 'Basic advertising presence with logo display and simple targeting.')}
                    {adPlanType === 'premium' && t('pricing.adPlans.premiumDescription', 'Enhanced visibility with prominent placement and detailed targeting options.')}
                    {adPlanType === 'enterprise' && t('pricing.adPlans.enterpriseDescription', 'Tailored advertising solutions with maximum visibility and exclusive features.')}
                  </p>
                  <button
                    className="block w-full py-3 px-6 text-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-300"
                  >
                    {t('pricing.adPlans.contactButton', 'Contact our team')}
                  </button>
                </div>
                
                <div className="space-y-6">
                  <h4 className="font-medium text-gray-800 mb-4">
                    {t('pricing.adPlans.featuresTitle', 'Key Features:')}
                  </h4>
                  
                  {adPlanType === 'standard' && (
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.standardFeature1', 'Logo placement on landing page')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.standardFeature2', 'Basic geographic targeting')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.standardFeature3', 'Monthly performance reports')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.standardFeature4', 'Up to 50 qualified leads per month')}</span>
                      </li>
                    </ul>
                  )}
                  
                  {adPlanType === 'premium' && (
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.premiumFeature1', 'Everything in Standard')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.premiumFeature2', 'Featured placement on calculator results')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.premiumFeature3', 'Advanced targeting (location, loan amount, term)')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.premiumFeature4', 'Weekly performance reports')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.premiumFeature5', 'Up to 200 qualified leads per month')}</span>
                      </li>
                    </ul>
                  )}
                  
                  {adPlanType === 'enterprise' && (
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.enterpriseFeature1', 'Everything in Premium')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.enterpriseFeature2', 'Direct loan product integration')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.enterpriseFeature3', 'Custom data integration via API')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.enterpriseFeature4', 'Real-time rate display in calculations')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.enterpriseFeature5', 'Dedicated account manager')}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{t('pricing.adPlans.enterpriseFeature6', 'Unlimited qualified leads')}</span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            {t('pricing.faq.title', 'Frequently Asked Questions')}
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {t('pricing.faq.question1', 'Can I upgrade or downgrade my plan later?')}
              </h3>
              <p className="text-gray-600">
                {t('pricing.faq.answer1', 'Yes, you can change your plan at any time. If you upgrade, you\'ll be charged the prorated difference. If you downgrade, you\'ll receive credit towards your next billing cycle.')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {t('pricing.faq.question2', 'Do you offer discounts for financial advisors or brokers?')}
              </h3>
              <p className="text-gray-600">
                {t('pricing.faq.answer2', 'Yes, we offer volume discounts for financial professionals who need multiple accounts. Please contact our sales team for more information on our professional packages.')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {t('pricing.faq.question3', 'How are qualified leads defined for advertisers?')}
              </h3>
              <p className="text-gray-600">
                {t('pricing.faq.answer3', 'Qualified leads are users who have completed a loan calculation matching your target criteria and have explicitly expressed interest in receiving more information about financing options.')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {t('pricing.faq.question4', 'Is there a trial period available?')}
              </h3>
              <p className="text-gray-600">
                {t('pricing.faq.answer4', 'We offer a 14-day free trial of our Pro plan so you can experience all the advanced features before committing. No credit card required to start your trial.')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {t('pricing.faq.question5', 'How do I cancel my subscription?')}
              </h3>
              <p className="text-gray-600">
                {t('pricing.faq.answer5', 'You can cancel your subscription at any time from your account settings page. Your access will continue until the end of your current billing period.')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-blue-600 rounded-xl shadow-xl overflow-hidden">
          <div className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-6 text-white">
              {t('pricing.cta.title', 'Ready to get started with LoanLogic?')}
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              {t('pricing.cta.subtitle', 'Join thousands of users making smarter financial decisions with our powerful loan visualization tools.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register" 
                className="inline-block bg-white text-blue-700 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-50 transition duration-300"
              >
                {t('pricing.cta.registerButton', 'Create free account')}
              </Link>
              <Link 
                href="/dashboard" 
                className="inline-block bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-700 transition duration-300"
              >
                {t('pricing.cta.demoButton', 'Try demo')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}