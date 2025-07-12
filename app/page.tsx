// Fájl: app/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Client from "@/lib/models/Client.model";
import { IClient } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Users, 
  BookOpen, 
  Award, 
  ChevronRight, 
  CheckCircle,
  Flame,
  HardHat,
  Utensils,
  Star,
  ArrowRight,
  Play,
  Sparkles
} from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    await dbConnect();
    const role = session.user.role;
    
    if (role === 'SUPER_ADMIN') {
      redirect('/admin/clients');
    }
    
    if (role === 'CLIENT_ADMIN') {
      redirect('/dashboard');
    }
    
    if (role === 'USER') {
      const client: IClient | null = await Client.findById(session.user.client).select('subscribedCourses');
      const courseId = client?.subscribedCourses?.[0];
      if (courseId) {
        redirect(`/course/${courseId}`);
      } else {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold">Hiba</h1>
            <p>Jelenleg nincs hozzárendelt tanfolyamod. Kérjük, vedd fel a kapcsolatot a feletteseddel.</p>
          </div>
        );
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden font-['Inter',_'system-ui',_sans-serif]">
      {/* Animated background elements */}
      <div className="absolute inset-0 animate-pulse opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-gray-300/5"></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce [animation-delay:-0.5s]"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-gray-300/10 rounded-full blur-xl animate-bounce [animation-delay:-1s]"></div>
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-white/8 rounded-full blur-xl animate-bounce [animation-delay:-1.5s]"></div>
      
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Shield className="h-8 w-8 text-white" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Tűz&Munkavédelem&HACCP</span>
        </div>
        <Button asChild variant="outline" className="border-white/20 text-black hover:bg-white/10 backdrop-blur-sm">
          <Link href="/login">
            <Users className="mr-2 h-4 w-4" />
            Bejelentkezés
          </Link>
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <Badge className="mb-8 bg-white/10 text-white border-white/20 px-6 py-2 text-sm backdrop-blur-sm">
            <Star className="mr-2 h-3 w-3" />
            Professzionális Oktatási Platform
          </Badge>

          {/* Main heading */}
          <h1 className="text-6xl lg:text-8xl font-black mb-8 text-white leading-none tracking-tight">
            Biztonság.
            <br />
            <span className="text-gray-300">Tudás.</span>
            <br />
            <span className="text-gray-400">Siker.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Interaktív képzések <span className="text-white font-semibold">tűzvédelem</span>, 
            <span className="text-white font-semibold"> munkavédelem</span> és 
            <span className="text-white font-semibold"> HACCP</span> területén. 
            Modern, gamifikált tanulási élmény a munkahelyi biztonság szolgálatában.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold group transition-all duration-300">
              <Link href="/login">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Kezdés most
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-black hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm">
              <Link href="#features">
                Tudj meg többet
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">1000+</div>
              <div className="text-gray-400">Siker faszom valami szó</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-400">Interaktív Modul</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Elérhető Platform</div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              Miért válaszd az <span className="text-gray-300">Tűz&Munkavédelem&HACCP</span>-t?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Modern technológia, gamifikált élmény és professzionális tartalmak egy helyen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="mb-4">
                  <Flame className="h-12 w-12 text-red-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Tűzvédelem</h3>
                <p className="text-gray-400 mb-4 font-light">
                  Átfogó tűzbiztonsági képzések interaktív szimulációkkal és valós helyzetekkel.
                </p>
                <div className="flex items-center text-white text-sm font-semibold">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Minősített Tananyag
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="mb-4">
                  <HardHat className="h-12 w-12 text-yellow-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Munkavédelem</h3>
                <p className="text-gray-400 mb-4 font-light">
                  Praktikus munkavédelmi ismeretek minden szektorhoz, naprakész jogszabályokkal.
                </p>
                <div className="flex items-center text-white text-sm font-semibold">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Jogszabály Konform
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="mb-4">
                  <Utensils className="h-12 w-12 text-green-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">HACCP</h3>
                <p className="text-gray-400 mb-4 font-light">
                  Élelmiszerbiztonság és higiénia szakértői szinten, gyakorlati példákkal.
                </p>
                <div className="flex items-center text-white text-sm font-semibold">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Minősített Oktatás
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="mb-4">
                  <BookOpen className="h-12 w-12 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Interaktív Tanulás</h3>
                <p className="text-gray-400 mb-4 font-light">
                  Gamifikált oktatás kvízekkel, pontgyűjtéssel és haladás követéssel.
                </p>
                <div className="flex items-center text-white text-sm font-semibold">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Modern Módszertan
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="mb-4">
                  <Users className="h-12 w-12 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Csapat Kezelés</h3>
                <p className="text-gray-400 mb-4 font-light">
                  Könnyű munkavállaló kezelés, haladás nyomon követés és riportok.
                </p>
                <div className="flex items-center text-white text-sm font-semibold">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="mb-4">
                  <Award className="h-12 w-12 text-pink-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Tanúsítványok</h3>
                <p className="text-gray-400 mb-4 font-light">
                  Hivatalos tanúsítványok a sikeres kurzusok elvégzése után.
                </p>
                <div className="flex items-center text-white text-sm font-semibold">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Letölthető PDF
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              Készen állsz a <span className="text-gray-300">biztonságos</span> jövőre?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-light">
              Csatlakozz több ezer vállalathoz, akik már a mi platformunkkal képzik munkatársaikat.
            </p>
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 px-10 py-4 text-xl font-semibold">
              <Link href="/login">
                <Sparkles className="mr-2 h-5 w-5" />
                Indítsuk el!
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 font-light">
            © 2025 Tűz&Munkavédelem&HACCP. Minden jog fenntartva.{" "}
            <span className="text-white">Biztonság. Tudás. Siker.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}