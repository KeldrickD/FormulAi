import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageSquare, BarChart3, Sparkles, Brain } from "lucide-react";
import WaitlistForm from "@/components/WaitlistForm";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Toaster */}
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-24 px-4 text-center bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Turn plain English into <span className="text-blue-300">spreadsheet superpowers</span>.
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Ask a question. Get formulas, charts, dashboards — instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/dashboard" 
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              Try It Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a 
              href="#demo"
              className="bg-blue-800 bg-opacity-50 backdrop-blur-sm text-white border border-blue-400 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-opacity-60 transition-colors"
            >
              Watch Demo
            </a>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-2xl border border-blue-400/20 max-w-4xl mx-auto">
        <Image
              src="/demo.gif" 
              alt="FormulAi Demo" 
              width={800} 
              height={450}
              className="w-full" 
          priority
        />
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center rounded-xl bg-blue-50 p-6 border border-blue-100">
            <div className="flex-grow">
              <h2 className="text-lg font-semibold text-blue-800 mb-1">
                Join the waitlist
              </h2>
              <p className="text-sm text-blue-700">
                Get early access and be the first to try FormulAi.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful AI Spreadsheet Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              FormulAi leverages artificial intelligence to transform how you work with spreadsheets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 text-blue-600 mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Natural Language</h3>
              <p className="text-gray-600">
                Ask questions in plain English and get instant results. No need to learn complex formulas.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 text-green-600 mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Auto-Dashboards</h3>
              <p className="text-gray-600">
                Generate beautiful visualizations and insights from your data with a single click.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 text-purple-600 mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Predictive Insights</h3>
              <p className="text-gray-600">
                Forecast future trends and get smart recommendations based on your historical data.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-amber-100 text-amber-600 mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Formula Explainer</h3>
              <p className="text-gray-600">
                Understand complex spreadsheet formulas with simple, plain-English explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  J
                </div>
                <div className="ml-3">
                  <div className="font-semibold">Jane Cooper</div>
                  <div className="text-sm text-gray-500">Data Analyst</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "FormulAi has saved me hours of work each week. Now I can generate complex analyses with just a few words."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl">
                  M
                </div>
                <div className="ml-3">
                  <div className="font-semibold">Michael Scott</div>
                  <div className="text-sm text-gray-500">Sales Manager</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "My team loves using FormulAi for our quarterly reports. The auto-dashboard feature is a game-changer."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">
                  S
                </div>
                <div className="ml-3">
                  <div className="font-semibold">Samantha Jones</div>
                  <div className="text-sm text-gray-500">Marketing Director</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The forecasting tools have transformed how we plan our marketing campaigns. It's like having a data scientist on the team."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to transform your spreadsheet experience?
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of users who are using AI to make their data work for them
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/dashboard" 
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Get Started for Free
          </Link>
          <a 
            href="#pricing"
            className="bg-blue-700 text-white border border-blue-500 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors"
          >
            View Pricing
          </a>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
          <Image
                src="/images/logo.png" 
                alt="FormulAi Logo" 
                width={160} 
                height={60} 
                className="mb-4"
                priority
              />
              <p className="text-gray-400 mb-4">AI-Powered Excel for Everyone</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/tutorials" className="text-gray-400 hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} FormulAi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
