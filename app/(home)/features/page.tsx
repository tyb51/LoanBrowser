"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '../../i18n/client';

export default function FeaturesPage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-6">
                {/* Page Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
                        {t('features.title', 'Powerful Loan Visualization Features')}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {t('features.subtitle', 'Explore the tools that make LoanLogic the ultimate loan calculation and comparison platform.')}
                    </p>
                </div>

                {/* Loan Calculator */}
                <div className="mb-24">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-16">
                        <div className="md:flex">
                            <div className="md:w-1/2 p-8 md:p-12">
                                <h2 className="text-3xl font-bold mb-6 text-gray-800">
                                    {t('features.loanCalculator.title', 'Comprehensive Loan Calculator')}
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    {t('features.loanCalculator.description1', 'Our advanced calculator handles multiple loan types including annuity, bullet, and modular loans with customizable parameters for complete flexibility.')}
                                </p>
                                <p className="text-gray-600 mb-6">
                                    {t('features.loanCalculator.description2', 'Input your specific loan parameters and instantly see how changes affect your monthly payments, total interest, and overall loan costs.')}
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className="text-gray-600">{t('features.loanCalculator.feature1', 'Multiple loan type support')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className="text-gray-600">{t('features.loanCalculator.feature2', 'Customizable interest rates and terms')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className="text-gray-600">{t('features.loanCalculator.feature3', 'Real-time calculation updates')}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8 md:p-12">
                                <div className="w-full max-w-md h-64 relative">
                                    <Image
                                        src="/dashboard-preview.svg"
                                        alt="Loan Calculator Interface"
                                        width={500}
                                        height={300}
                                        className="rounded-lg shadow-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Visualizations */}
                <div className="mb-24">
                    <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">
                        {t('features.visualizations.title', 'Interactive Visualizations')}
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-8 transition-transform duration-300 hover:scale-105">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                {t('features.visualizations.chart1.title', 'Loan Balance Over Time')}
                            </h3>
                            <p className="text-gray-600">
                                {t('features.visualizations.chart1.description', 'Watch your loan balance decrease over time with our interactive chart. Visualize the impact of extra payments and see exactly when your loan will be paid off.')}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 transition-transform duration-300 hover:scale-105">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                {t('features.visualizations.chart2.title', 'Payment Breakdown')}
                            </h3>
                            <p className="text-gray-600">
                                {t('features.visualizations.chart2.description', 'See exactly how your payments are distributed between principal, interest, and insurance with our detailed breakdown charts. Understand where your money is going each month.')}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 transition-transform duration-300 hover:scale-105">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                {t('features.visualizations.chart3.title', 'Amortization Schedule')}
                            </h3>
                            <p className="text-gray-600">
                                {t('features.visualizations.chart3.description', 'Access a complete month-by-month breakdown of your loan payments with our detailed amortization tables. Filter and sort to find the information you need quickly.')}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 transition-transform duration-300 hover:scale-105">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                {t('features.visualizations.chart4.title', 'Loan Comparison')}
                            </h3>
                            <p className="text-gray-600">
                                {t('features.visualizations.chart4.description', 'Compare multiple loan scenarios side-by-side to identify the best option for your needs. Visualize differences in monthly payments, total costs, and payoff timelines.')}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 transition-transform duration-300 hover:scale-105">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                {t('features.visualizations.chart5.title', 'Investment Simulation')}
                            </h3>
                            <p className="text-gray-600">
                                {t('features.visualizations.chart5.description', 'Simulate how investing alongside your loan payments can impact your overall financial position. Find the optimal balance between paying down debt and growing your investments.')}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 transition-transform duration-300 hover:scale-105">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                {t('features.visualizations.chart6.title', 'Insurance Approximator')}
                            </h3>
                            <p className="text-gray-600">
                                {t('features.visualizations.chart6.description', 'Estimate life and home insurance costs based on your personal information and loan details. Visualize how insurance affects your total loan costs over time.')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Advanced Features */}
                <div className="mb-24">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-16">
                        <div className="md:flex flex-row-reverse">
                            <div className="md:w-1/2 p-8 md:p-12">
                                <h2 className="text-3xl font-bold mb-6 text-gray-800">
                                    {t('features.advanced.title', 'Advanced Features for Professionals')}
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    {t('features.advanced.description1', 'LoanLogic includes specialized tools for financial advisors, mortgage brokers, and other professionals who need to manage multiple clients and cases.')}
                                </p>
                                <p className="text-gray-600 mb-6">
                                    {t('features.advanced.description2', 'Our case management system allows you to organize all your client information, loan simulations, and documents in one secure location.')}
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className="text-gray-600">{t('features.advanced.feature1', 'Multi-client management')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className="text-gray-600">{t('features.advanced.feature2', 'Case/dossier organization')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className="text-gray-600">{t('features.advanced.feature3', 'Client portal access')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className="text-gray-600">{t('features.advanced.feature4', 'White-labeling options')}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="md:w-1/2 bg-gray-900 flex items-center justify-center p-8 md:p-12">
                                <div className="w-full max-w-md h-64 relative">
                                    <div className="text-white text-center">
                                        <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                        <h3 className="text-xl font-bold mb-2">
                                            {t('features.advanced.enterprise', 'Enterprise-Ready')}
                                        </h3>
                                        <p className="text-blue-200">
                                            {t('features.advanced.security', 'Secure, scalable, and built for businesses of all sizes.')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integration & Export */}
                <div className="mb-24">
                    <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">
                        {t('features.integration.title', 'Integration & Export Options')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                {t('features.integration.export.title', 'Export Options')}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {t('features.integration.export.description', 'Export your calculations and visualizations in multiple formats for sharing or record-keeping.')}
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">PDF Reports</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">CSV Data Files</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">Excel Spreadsheets</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">Image Files (PNG/JPG)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                {t('features.integration.api.title', 'API Integration')}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {t('features.integration.api.description', 'Integrate LoanLogic calculations directly into your own applications using our robust API.')}
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">RESTful API</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">Webhook Support</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">Detailed Documentation</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">Developer Support</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                {t('features.integration.sharing.title', 'Sharing & Collaboration')}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {t('features.integration.sharing.description', 'Share your calculations and reports with clients, colleagues, or partners for collaborative decision-making.')}
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">Shareable Links</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">Email Reports</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">Embedded Calculators</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600">Team Access Control</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );  
}
