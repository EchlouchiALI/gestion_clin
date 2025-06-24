"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Phone, MapPin, Mail, Menu, X, Star, Award, Users, Clock, ChevronRight, Heart, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setFormData({ name: "", email: "", phone: "", message: "" })
    alert("Message envoyé avec succès!")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="bg-white text-gray-900 font-sans overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-white/90 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Polyclinique Atlas
                </h1>
                <p className="text-xs text-gray-500">Excellence Médicale</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {["Accueil", "À propos", "Services", "Équipe", "Contact"].map((item, index) => (
                <a
                  key={index}
                  href={`#${item.toLowerCase().replace("à propos", "about").replace("équipe", "team")}`}
                  className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                Urgences 24/7
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
            <Button variant="ghost" className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>

                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50">
              <div className="px-4 py-6 space-y-4">
                {["Accueil", "À propos", "Services", "Équipe", "Contact"].map((item, index) => (
                  <a
                    key={index}
                    href={`#${item.toLowerCase().replace("à propos", "about").replace("équipe", "team")}`}
                    className="block text-gray-700 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with parallax effect */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
                <Star className="h-4 w-4 mr-2" />
                Clinique de référence à Fès
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Polyclinique
                </span>
                <br />
                <span className="text-gray-900">Atlas</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                Excellence médicale et innovation technologique au service de votre santé. Une équipe de spécialistes
                dédiée à votre bien-être.
              </p>

              <div className="flex items-center text-gray-500 mb-8">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                <span>Route De Sefrou, Fès 30000</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/login">
      <Button className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        Prendre rendez-vous
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </Link>
                
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">15+</div>
                  <div className="text-sm text-gray-500">Années d'expérience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">50+</div>
                  <div className="text-sm text-gray-500">Spécialistes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600 mb-1">10k+</div>
                  <div className="text-sm text-gray-500">Patients satisfaits</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/img/1.png"
                  width={500}
                  height={600}
                  className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
                  alt="Polyclinique Atlas - Établissement médical moderne"
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center animate-pulse">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nos Valeurs
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des principes fondamentaux qui guident chaque aspect de notre pratique médicale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Humanité",
                description:
                  "Le patient au centre de toutes nos préoccupations avec une approche personnalisée et bienveillante.",
                gradient: "from-red-500 to-pink-500",
              },
              {
                icon: Award,
                title: "Excellence",
                description:
                  "Standards médicaux les plus élevés avec des équipements de pointe et une formation continue.",
                gradient: "from-blue-500 to-purple-500",
              },
              {
                icon: Zap,
                title: "Innovation",
                description:
                  "Technologies médicales avancées et méthodes thérapeutiques innovantes pour de meilleurs résultats.",
                gradient: "from-purple-500 to-indigo-500",
              },
            ].map((value, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50 hover:scale-105"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <value.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* À PROPOS */}
      <section
        id="about"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-300 text-sm font-medium mb-6">
                <Award className="h-4 w-4 mr-2" />
                Établissement de référence
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                À propos de
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}
                  nous
                </span>
              </h2>

              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                Établissement médico-chirurgical de pointe à Fès, nous combinons expertise médicale, technologies
                avancées et approche humaine pour offrir des soins d'exception.
              </p>

              <p className="text-gray-400 mb-8 leading-relaxed">
                Notre équipe multidisciplinaire de spécialistes reconnus s'engage à fournir des soins personnalisés dans
                un environnement moderne et sécurisé.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
                  <div className="text-sm text-gray-300">Service d'urgence</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                  <div className="text-sm text-gray-300">Satisfaction patient</div>
                </div>
              </div>

            
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardContent className="p-6">
                      <Users className="h-8 w-8 text-blue-400 mb-4" />
                      <h4 className="font-bold mb-2">Équipe experte</h4>
                      <p className="text-sm text-gray-300">Professionnels qualifiés et dévoués</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardContent className="p-6">
                      <Shield className="h-8 w-8 text-purple-400 mb-4" />
                      <h4 className="font-bold mb-2">Sécurité maximale</h4>
                      <p className="text-sm text-gray-300">Protocoles stricts et environnement sécurisé</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6 mt-12">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardContent className="p-6">
                      <Zap className="h-8 w-8 text-pink-400 mb-4" />
                      <h4 className="font-bold mb-2">Technologies avancées</h4>
                      <p className="text-sm text-gray-300">Équipements médicaux de dernière génération</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardContent className="p-6">
                      <Clock className="h-8 w-8 text-green-400 mb-4" />
                      <h4 className="font-bold mb-2">Disponibilité</h4>
                      <p className="text-sm text-gray-300">Service continu pour votre santé</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Services Médicaux
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une gamme complète de spécialités médicales avec des équipements de pointe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Cardiologie",
                description: "Diagnostic et traitement des maladies cardiovasculaires avec équipements de pointe",
                icon: "❤️",
                gradient: "from-red-500 to-pink-500",
              },
              {
                title: "Neurologie",
                description: "Prise en charge spécialisée des troubles du système nerveux",
                icon: "🧠",
                gradient: "from-purple-500 to-indigo-500",
              },
              {
                title: "Dialyse",
                description: "Centre de dialyse moderne avec suivi personnalisé des patients",
                icon: "🩺",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                title: "Radiologie",
                description: "Imagerie médicale avancée : Scanner, IRM, Échographie",
                icon: "📡",
                gradient: "from-green-500 to-teal-500",
              },
              {
                title: "Chirurgie",
                description: "Interventions chirurgicales avec techniques mini-invasives",
                icon: "⚕️",
                gradient: "from-orange-500 to-red-500",
              },
              {
                title: "Médecine Interne",
                description: "Diagnostic et traitement des pathologies complexes",
                icon: "🔬",
                gradient: "from-violet-500 to-purple-500",
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:scale-105 hover:-translate-y-2"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-2xl">{service.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
                 
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ÉQUIPE MÉDICALE */}
      <section id="team" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Notre Équipe
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des professionnels de santé reconnus, dédiés à votre bien-être
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: "Dr Azzeddine Houssaini",
                specialty: "Gynécologue Obstétricien",
                description: "Spécialiste reconnu avec plus de 15 ans d'expérience",
                gradient: "from-blue-500 to-purple-500",
              },
              {
                name: "Pr Mohammed El Abkari",
                specialty: "Gastro-entérologue",
                description: "Professeur universitaire et expert en gastro-entérologie",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                name: "Dr Fahd Khalil",
                specialty: "Urologue",
                description: "Chirurgien urologue spécialisé en techniques mini-invasives",
                gradient: "from-green-500 to-blue-500",
              },
              {
                name: "Dr Mohamed Hammou",
                specialty: "Néphrologue",
                description: "Expert en néphrologie et dialyse, formation internationale",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((doctor, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50 hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div
                      
                    >
                      
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                      <p className="text-blue-600 font-semibold mb-2">{doctor.specialty}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{doctor.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Contactez-nous
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Notre équipe est à votre disposition pour répondre à vos questions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold mb-8">Informations de contact</h3>

              <div className="space-y-6 mb-12">
                <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Adresse</h4>
                    <p className="text-gray-300">Route De Sefrou, Fès 30000</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Téléphone</h4>
                    <p className="text-gray-300">+212 535 00 00 00</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-gray-300">contact@polyclinique-atlas.ma</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h4 className="text-xl font-bold mb-4">Horaires d'ouverture</h4>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span>8h00 - 20h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span>8h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span>9h00 - 17h00</span>
                  </div>
                  <div className="flex justify-between text-green-400 font-semibold pt-2 border-t border-white/20">
                    <span>Urgences</span>
                    <span>24h/24</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-white">Envoyez-nous un message</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                        placeholder="Nom complet"
                        required
                      />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                        placeholder="Email"
                        required
                      />
                    </div>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                      placeholder="Téléphone"
                    />
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 min-h-[120px] rounded-xl"
                      placeholder="Votre message"
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Envoyer le message
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Polyclinique Atlas
                </h3>
              </div>
            </div>
            <p className="text-gray-400 mb-8">Excellence médicale • Innovation • Humanité</p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">© {new Date().getFullYear()} Polyclinique Atlas. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
