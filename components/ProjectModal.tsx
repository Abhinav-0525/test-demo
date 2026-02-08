'use client';

import Image from 'next/image';
import React from 'react';

interface ProjectDetails {
  location: string;
  duration: string;
  budget: string;
  client: string;
  scope: string;
  features: string[];
}

interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  details: ProjectDetails;
}

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-none max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/30 shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="sticky top-4 right-4 float-right z-10 bg-white hover:bg-gray-200 text-black p-2 rounded-none transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Project Image */}
          <div className="relative h-96 overflow-hidden">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="inline-block bg-white text-black px-4 py-1 rounded-none text-sm font-semibold mb-3 uppercase tracking-wider">
                {project.category}
              </span>
              <h2 className="text-4xl font-bold text-white tracking-tight">{project.title}</h2>
            </div>
          </div>

          {/* Project Content */}
          <div className="p-8">
            {/* Description */}
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">{project.description}</p>

            {/* Divider */}
            <div className="w-full h-px bg-white/20 mb-8" />

            {/* Project Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-none p-6 border border-white/20">
                <h4 className="text-gray-400 font-semibold mb-2 uppercase tracking-wider text-sm">Location</h4>
                <p className="text-white text-lg">{project.details.location}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-none p-6 border border-white/20">
                <h4 className="text-gray-400 font-semibold mb-2 uppercase tracking-wider text-sm">Duration</h4>
                <p className="text-white text-lg">{project.details.duration}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-none p-6 border border-white/20">
                <h4 className="text-gray-400 font-semibold mb-2 uppercase tracking-wider text-sm">Budget</h4>
                <p className="text-white text-lg">{project.details.budget}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-none p-6 border border-white/20">
                <h4 className="text-gray-400 font-semibold mb-2 uppercase tracking-wider text-sm">Client</h4>
                <p className="text-white text-lg">{project.details.client}</p>
              </div>
            </div>

            {/* Project Scope */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight uppercase">Project Scope</h3>
              <div className="w-16 h-1 bg-white mb-4" />
              <p className="text-gray-300 text-lg leading-relaxed">
                {project.details.scope}
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/20 mb-8" />

            {/* Key Features */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight uppercase">Key Features</h3>
              <div className="w-16 h-1 bg-white mb-6" />
              <div className="grid md:grid-cols-2 gap-4">
                {project.details.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-gradient-to-br from-gray-900 to-black rounded-none p-4 border border-white/20 hover:border-white/50 transition-colors"
                  >
                    <div className="w-2 h-2 bg-white rounded-none mt-2 flex-shrink-0" />
                    <p className="text-gray-300">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}