'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrochureModal from '@/components/BrochureModal';
import React from 'react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-wider">ASBL</h1>
          <div className="flex gap-8">
            <Link href="/" className="text-white hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link href="/projects" className="text-white hover:text-gray-300 transition-colors">
              Projects
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Building Tomorrow's
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white animate-pulse">
              Infrastructure Today
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Leading the way in innovative construction solutions with excellence, sustainability, and integrity
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black px-8 py-4 rounded-none text-lg font-semibold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl border-2 border-white"
          >
            Open Brochure
          </button>
        </div>
        {/* Decorative lines */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold text-white text-center mb-16 tracking-tight">
            Our Core Values
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Customer Centricity',
                description: 'Putting clients at the heart of everything we do to deliver tailored construction solutions',
                icon: '🤝'
              },
              {
                title: 'Passion for Perfection',
                description: 'Delivering superior quality in every project with meticulous attention to detail',
                icon: '🎯'
              },
              {
                title: 'Integrity',
                description: 'Building trust through transparency, reliability, and timely delivery',
                icon: "🛠️"
              }
            ].map((value, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-br from-gray-900 to-black rounded-none p-8 border border-white/20 hover:border-white transition-all hover:transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-5xl mb-4 grayscale">{value.icon}</div>
                <h4 className="text-2xl font-bold text-white mb-4 tracking-wide">{value.title}</h4>
                <p className="text-gray-400 leading-relaxed relative z-10">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Characteristics Section */}
      <section className="py-20 px-6 bg-black relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto relative z-10">
          <h3 className="text-4xl md:text-5xl font-bold text-white text-center mb-16 tracking-tight">
            Why Choose ASBL
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              '30+ Years of Industry Experience',
              'ISO Certified Quality Standards',
              'Sustainable & Eco-Friendly Solutions',
              'On-Time Project Delivery',
              'Expert Engineering Team',
              'Comprehensive After-Sales Support'
            ].map((item, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-4 bg-gradient-to-r from-gray-900 to-black rounded-none p-6 border border-white/10 hover:border-white/30 transition-all hover:bg-white/5"
              >
                <div className="w-2 h-2 bg-white rounded-full group-hover:scale-150 transition-transform" />
                <p className="text-lg text-gray-300 group-hover:text-white transition-colors">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Start Your Project?
          </h3>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Explore our portfolio of successful projects and see excellence in action
          </p>
          <Link
            href="/projects"
            className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-none text-lg font-semibold hover:bg-white hover:text-black transition-all transform hover:scale-105"
          >
            View Our Projects
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 bg-black">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; 2025 ASBL. All rights reserved.</p>
        </div>
      </footer>

      {/* Brochure Modal */}
      <BrochureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}