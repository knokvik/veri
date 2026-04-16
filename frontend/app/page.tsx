import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Camera, Satellite, Database, CheckCircle2, ShieldCheck, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center mt-12 md:mt-24 max-w-5xl mx-auto space-y-12 animate-fadeIn">

      <Badge variant="outline" className="px-5 py-2 rounded-full border-primary/30 bg-primary/5 text-primary text-sm font-medium animate-slideUp shadow-sm">
        🇮🇳 India CCTS 2026 Compatible
      </Badge>

      <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1]">
        Transparent Forestry <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
          Carbon Credits.
        </span>
      </h1>

      <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
        Leveraging DeepForest ML, Satellite Analytics, and Immutable Ledgers to automate compliance for high-integrity carbon offsets.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button asChild size="lg" className="text-lg px-10 h-14 rounded-full font-bold shadow-xl hover:scale-105 transition-all">
          <Link href="/login">🚀 Get Started <ArrowRight className="ml-2 w-5 h-5" /></Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="text-lg px-10 h-14 rounded-full font-bold hover:bg-secondary/50 transition-all">
          <Link href="/login">Connect Wallet</Link>
        </Button>
      </div>

      {/* Features Grid */}
      <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full pt-16 border-t border-border">
        <Card className="group hover:border-primary/50 transition-all duration-300">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">ML Vision</CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed">
              DeepForest algorithms process high-res photography to accurately detect tree counts and canopy survival models.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:border-blue-500/50 transition-all duration-300">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Satellite className="w-6 h-6 text-blue-500" />
            </div>
            <CardTitle className="text-xl font-bold text-blue-500">Satellite Auth</CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed">
              Google Earth Engine integration parses direct NDVI indices and biomass estimates from Sentinel-2 imagery.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:border-purple-500/50 transition-all duration-300">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-purple-500" />
            </div>
            <CardTitle className="text-xl font-bold text-purple-500">Incorruptible</CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed">
              Low-friction minting via audited ERC-1155 contracts ensures immutable generation events on Polygon.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* How it works */}
      <div className="w-full pt-20 border-t border-border pb-12">
        <h2 className="text-3xl font-bold mb-12">Streamlined Verification</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Submit', desc: 'Secure data upload', icon: <Zap className="w-6 h-6" /> },
            { step: '2', title: 'Analyze', desc: 'AI + Satellite MRV', icon: <ShieldCheck className="w-6 h-6" /> },
            { step: '3', title: 'Validate', desc: 'CCTS Compliance', icon: <CheckCircle2 className="w-6 h-6" /> },
            { step: '4', title: 'Mint', desc: 'Asset Tokenization', icon: <ArrowRight className="w-6 h-6" /> },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-border flex items-center justify-center mb-4 transition-transform hover:rotate-6">
                <div className="text-primary">{s.icon}</div>
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-primary/60 mb-1">Step {s.step}</span>
              <h4 className="font-bold text-lg mb-1">{s.title}</h4>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
