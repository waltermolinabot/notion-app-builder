export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Globe, Shield, CheckCircle } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg" />
            <span className="text-xl font-bold text-slate-900">Notion App Builder</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-slate-600 hover:text-slate-900">Features</Link>
            <Link href="#pricing" className="text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link href="#faq" className="text-slate-600 hover:text-slate-900">FAQ</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-slate-600 hover:text-slate-900">Sign in</Link>
            <Link href="/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Client Portals from Notion
            <br />
            <span className="text-blue-600">Without Code</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Transform your Notion databases into beautiful client portals, directories, 
            and web apps in minutes. No coding required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Connect Your Notion
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg">
                See Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Notion Integration</h3>
              <p className="text-slate-600">
                Connect your workspace and select any database. Changes sync automatically.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1-Click Publish</h3>
              <p className="text-slate-600">
                Publish to a custom subdomain instantly. Share with your clients securely.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Private Access</h3>
              <p className="text-slate-600">
                Protect portals with email authentication. Control who sees what.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 text-center mb-12">
            Start free, upgrade when you need more
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="border rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">$0</div>
              <p className="text-slate-600 mb-6">For testing and small projects</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">1 app</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">100 users</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Basic templates</span>
                </li>
              </ul>
              <Link href="/sign-up">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </div>
            
            {/* Pro */}
            <div className="border-2 border-blue-600 rounded-xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-4">$39<span className="text-lg text-slate-500">/mo</span></div>
              <p className="text-slate-600 mb-6">For growing agencies</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">5 apps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">1,000 users</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Private auth</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Custom branding</span>
                </li>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
              </Link>
            </div>
            
            {/* Agency */}
            <div className="border rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-2">Agency</h3>
              <div className="text-4xl font-bold mb-4">$149<span className="text-lg text-slate-500">/mo</span></div>
              <p className="text-slate-600 mb-6">For professional use</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Unlimited apps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">10,000 users</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">White-label</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Custom domains</span>
                </li>
              </ul>
              <Link href="/sign-up">
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to build client portals?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Join thousands of agencies delivering beautiful Notion-powered experiences to their clients.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Building for Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; 2026 Notion App Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
