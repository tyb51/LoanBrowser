"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '../../i18n/client';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            {t('about.title', 'About LoanLogic')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.subtitle', 'Empowering users with powerful tools to make better financial decisions.')}
          </p>
        </div>

        {/* Our Mission Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-16">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                {t('about.mission.title', 'Our Mission')}
              </h2>
              <p className="text-gray-600 mb-4">
                {t('about.mission.paragraph1', 'At LoanLogic, we believe that financial decisions should be made with complete transparency and understanding. Our mission is to demystify complex loan structures and empower individuals to make informed choices about their financial future.')}
              </p>
              <p className="text-gray-600">
                {t('about.mission.paragraph2', 'We\'ve developed powerful visualization tools that make it easy to see exactly how different loan options affect your finances over time, allowing you to compare scenarios and find the option that best fits your unique situation.')}
              </p>
            </div>
            <div className="md:w-1/2 bg-blue-100 flex items-center justify-center p-12">
              <div className="w-full max-w-sm h-64 relative">
                <div className="absolute inset-0 bg-blue-600 rounded-lg opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
            {t('about.story.title', 'Our Story')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {t('about.story.beginning.title', 'The Beginning')}
              </h3>
              <p className="text-gray-600">
                {t('about.story.beginning.description', 'LoanLogic started in 2022 when our founders, frustrated by the lack of transparency in mortgage calculations, set out to create a tool that would make complex financial decisions clear and accessible to everyone.')}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {t('about.story.growth.title', 'Growth & Development')}
              </h3>
              <p className="text-gray-600">
                {t('about.story.growth.description', 'Over the years, we\'ve expanded our functionality to include investment simulations, insurance approximation, and advanced comparison tools. Our user base has grown to include not just individuals, but financial advisors and mortgage brokers.')}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {t('about.story.today.title', 'Today & Beyond')}
              </h3>
              <p className="text-gray-600">
                {t('about.story.today.description', 'Today, LoanLogic helps thousands of users make better financial decisions. We continue to innovate with new features like multi-client management, case systems, and integrations with financial institutions.')}
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
            {t('about.team.title', 'Our Team')}
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800">Jan Demeester</h3>
              <p className="text-gray-500 text-sm mb-4">CEO & Co-Founder</p>
              <p className="text-gray-600 text-sm">
                {t('about.team.member1.bio', 'Former financial advisor with 15+ years of experience in the mortgage industry.')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800">Sophie Van Damme</h3>
              <p className="text-gray-500 text-sm mb-4">CTO & Co-Founder</p>
              <p className="text-gray-600 text-sm">
                {t('about.team.member2.bio', 'Software engineer with expertise in fintech and data visualization.')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800">Thomas Verhoeven</h3>
              <p className="text-gray-500 text-sm mb-4">Chief Product Officer</p>
              <p className="text-gray-600 text-sm">
                {t('about.team.member3.bio', 'Product designer focused on creating intuitive financial tools for non-experts.')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800">Elise Peeters</h3>
              <p className="text-gray-500 text-sm mb-4">Chief Marketing Officer</p>
              <p className="text-gray-600 text-sm">
                {t('about.team.member4.bio', 'Marketing strategist with a background in financial education and consumer advocacy.')}
              </p>
            </div>
          </div>
        </div>

        {/* Partners & Investors */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
            {t('about.partners.title', 'Our Partners & Investors')}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-24">
              <div className="w-32 h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-24">
              <div className="w-32 h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-24">
              <div className="w-32 h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-24">
              <div className="w-32 h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-xl shadow-xl overflow-hidden">
          <div className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-6 text-white">
              {t('about.cta.title', 'Join us in revolutionizing financial decision-making')}
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              {t('about.cta.subtitle', 'Experience the power of clear, visual loan comparisons and make your next financial decision with confidence.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register" 
                className="inline-block bg-white text-blue-700 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-50 transition duration-300"
              >
                {t('about.cta.registerButton', 'Create free account')}
              </Link>
              <Link 
                href="/contact" 
                className="inline-block bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-700 transition duration-300"
              >
                {t('about.cta.contactButton', 'Contact us')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}