'use client';

import { useState } from 'react';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useState(() => {
    setIsLoaded(true);
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 SaaS App Template
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive, production-ready SaaS application template built
            with Next.js 15, TypeScript, and modern development tools.
          </p>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon="🔐"
            title="Authentication Ready"
            description="Pre-configured with Clerk for secure user management and authentication flows."
          />
          <FeatureCard
            icon="💳"
            title="Payment Integration"
            description="Stripe integration ready for subscriptions, one-time payments, and billing management."
          />
          <FeatureCard
            icon="📊"
            title="Analytics & Monitoring"
            description="PostHog analytics and Sentry error tracking integrated for comprehensive monitoring."
          />
          <FeatureCard
            icon="🏗️"
            title="Modern Architecture"
            description="Built with Next.js 15, TypeScript, Tailwind CSS, and industry best practices."
          />
          <FeatureCard
            icon="🚢"
            title="Deployment Ready"
            description="Pre-configured for Railway deployment with CI/CD pipelines and automated workflows."
          />
          <FeatureCard
            icon="📚"
            title="Auto Documentation"
            description="Automated documentation generation and architecture diagrams with every code change."
          />
        </div>

        {/* Getting Started */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Getting Started
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Clone the Template
                </h3>
                <p className="text-gray-600">
                  Use GitHub&apos;s &ldquo;Use this template&rdquo; button to
                  create your repository.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Configure Environment
                </h3>
                <p className="text-gray-600">
                  Copy{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    .env.example
                  </code>{' '}
                  to{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    .env.local
                  </code>{' '}
                  and add your API keys.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">Install & Run</h3>
                <p className="text-gray-600">
                  Run{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    npm install
                  </code>{' '}
                  and{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    npm run dev
                  </code>{' '}
                  to start developing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Technology Stack
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Next.js 15',
              'TypeScript',
              'Tailwind CSS',
              'Clerk Auth',
              'Stripe',
              'Railway',
              'PostHog',
              'Sentry',
            ].map(tech => (
              <span
                key={tech}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Status Indicator */}
        {isLoaded && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            ✅ Template Loaded Successfully
          </div>
        )}
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
