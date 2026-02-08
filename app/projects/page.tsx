'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProjectModal from '@/components/ProjectModal';
import React from 'react';

interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  details: {
    location: string;
    duration: string;
    budget: string;
    client: string;
    scope: string;
    features: string[];
  };
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Modern Commercial Complex with lot of modern features',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    description: 'State-of-the-art commercial building with sustainable design features',
    details: {
      location: 'Downtown Business District',
      duration: '18 months',
      budget: '$25M',
      client: 'Metropolitan Developments',
      scope: 'Complete design, construction, and interior finishing of a 15-story commercial tower',
      features: [
        'LEED Gold Certified',
        'Smart building automation',
        'Energy-efficient HVAC systems',
        'Premium grade finishes',
        'Multi-level parking facility'
      ]
    }
  },
  {
    id: 2,
    title: 'Luxury Residential Towers',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    description: 'Twin residential towers featuring premium amenities and panoramic views',
    details: {
      location: 'Riverside Heights',
      duration: '24 months',
      budget: '$40M',
      client: 'Prestige Living Ltd',
      scope: 'Construction of two 30-story residential towers with 400+ luxury apartments',
      features: [
        'Rooftop infinity pool',
        'State-of-the-art fitness center',
        'Landscaped gardens',
        'Smart home integration',
        '24/7 concierge services'
      ]
    }
  },
  {
    id: 3,
    title: 'Industrial Manufacturing Hub',
    category: 'Industrial',
    image: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop',
    description: 'Advanced manufacturing facility with cutting-edge infrastructure',
    details: {
      location: 'Industrial Park Zone',
      duration: '12 months',
      budget: '$15M',
      client: 'TechManufacture Inc',
      scope: 'Design and construction of a 200,000 sq ft manufacturing facility',
      features: [
        'Heavy-duty structural design',
        'Advanced ventilation systems',
        'Loading dock facilities',
        'Office and administrative spaces',
        'Warehouse storage areas'
      ]
    }
  },
  {
    id: 4,
    title: 'Educational Campus',
    category: 'Educational',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
    description: 'Modern university campus with innovative learning spaces',
    details: {
      location: 'University District',
      duration: '30 months',
      budget: '$60M',
      client: 'State Education Board',
      scope: 'Complete campus development including academic buildings, library, and student facilities',
      features: [
        'Smart classrooms',
        'Research laboratories',
        'Sports complex',
        'Student housing',
        'Sustainable campus design'
      ]
    }
  },
  {
    id: 5,
    title: 'Healthcare Medical Center',
    category: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop',
    description: 'Comprehensive medical facility with advanced healthcare infrastructure',
    details: {
      location: 'Medical District',
      duration: '22 months',
      budget: '$35M',
      client: 'HealthCare Solutions',
      scope: 'Construction of multi-specialty hospital with 250 beds',
      features: [
        'Advanced OT suites',
        'ICU and emergency facilities',
        'Diagnostic imaging center',
        'Pharmacy and laboratory',
        'Healing garden spaces'
      ]
    }
  },
  {
    id: 6,
    title: 'Mixed-Use Urban Development',
    category: 'Mixed-Use',
    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=600&fit=crop',
    description: 'Integrated development combining retail, residential, and entertainment',
    details: {
      location: 'City Center',
      duration: '36 months',
      budget: '$80M',
      client: 'Urban Ventures Group',
      scope: 'Master-planned development with retail, residential, office, and entertainment components',
      features: [
        'Shopping mall',
        'Residential apartments',
        'Office spaces',
        'Multiplex cinema',
        'Food court and restaurants'
      ]
    }
  }
];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];
  
  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

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

      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-50" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">Our Projects</h2>
          <div className="w-24 h-1 bg-white mx-auto mb-6" />
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore our portfolio of successful projects across various sectors
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="pb-12 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-none font-semibold transition-all border-2 ${
                  filter === category
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-20 px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer bg-gradient-to-br from-gray-900 to-black rounded-none overflow-hidden border border-white/20 hover:border-white transition-all hover:transform hover:scale-105"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                  <div className="absolute top-4 right-4 bg-white text-black px-4 py-1 rounded-none text-sm font-semibold">
                    {project.category}
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-b from-gray-900 to-black">
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">{project.title}</h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">{project.description}</p>
                  <span className="text-white font-semibold group-hover:underline transition-all flex items-center gap-2">
                    View Details 
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 bg-black">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; 2025 ASBL. All rights reserved.</p>
        </div>
      </footer>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}