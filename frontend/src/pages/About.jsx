// src/pages/About.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Users,
    Calendar,
    Award,
    Heart,
    Target,
    Eye,
    CheckCircle,
    ArrowRight,
    Star,
    Shield,
    Clock,
    MapPin,
    Phone,
    Mail,
    MessageSquare,
    Quote
} from 'lucide-react';

const About = () => {
    const navigate = useNavigate();

    const stats = [
        { number: '500+', label: 'Venues Listed', icon: '🏛️' },
        { number: '10K+', label: 'Happy Customers', icon: '😊' },
        { number: '4.8★', label: 'Average Rating', icon: '⭐' },
        { number: '5+', label: 'Years of Excellence', icon: '🏆' }
    ];

    const values = [
        {
            icon: <Heart className="w-6 h-6" />,
            title: 'Customer First',
            description: 'We prioritize your needs and ensure the best experience possible.'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Trust & Transparency',
            description: 'No hidden fees, honest pricing, and verified venues only.'
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: 'Quality Assurance',
            description: 'Every venue is carefully vetted to meet our quality standards.'
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: '24/7 Support',
            description: 'Our team is always here to help you with any questions.'
        }
    ];

    const milestones = [
        { year: '2020', title: 'Founded', description: 'VenueAI started with a mission to simplify venue booking in Bhopal' },
        { year: '2021', title: '100+ Venues', description: 'Partnered with over 100 premium venues across the city' },
        { year: '2022', title: '5K Customers', description: 'Served over 5,000 happy customers for their special events' },
        { year: '2023', title: 'AI Integration', description: 'Launched AI-powered venue recommendation system' },
        { year: '2024', title: '10K Milestone', description: 'Reached 10,000+ successful bookings and counting!' }
    ];

    const team = [
        {
            name: 'Rahul Sharma',
            role: 'Founder & CEO',
            avatar: '👨‍💼',
            bio: 'Event management expert with 10+ years of experience'
        },
        {
            name: 'Priya Patel',
            role: 'Head of Operations',
            avatar: '👩‍💼',
            bio: 'Ensuring smooth venue partnerships and customer satisfaction'
        },
        {
            name: 'Amit Verma',
            role: 'Tech Lead',
            avatar: '👨‍💻',
            bio: 'Building the future of venue discovery with AI'
        },
        {
            name: 'Neha Gupta',
            role: 'Customer Success',
            avatar: '👩‍🎓',
            bio: 'Making sure every customer finds their perfect venue'
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8F5FF] text-[#23113F]">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#7C3AED]/10 via-[#F8F5FF] to-[#7C3AED]/10 pt-20 pb-32 px-4">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-[#7C3AED]/20">
                        <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                        <span className="text-sm font-medium text-[#7C3AED]">Our Story</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#23113F] via-[#7C3AED] to-[#23113F] bg-clip-text text-transparent">
                        About <span className="text-[#7C3AED]">VenueAI</span>
                    </h1>
                    <p className="text-lg text-[#23113F]/80 mb-10 max-w-3xl mx-auto">
                        We're on a mission to transform how people discover and book venues in Bhopal.
                        With AI-powered recommendations and a commitment to quality, we're making event planning effortless.
                    </p>
                    <button
                        onClick={() => navigate('/services')}
                        className="bg-[#7C3AED] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#6D28D9] transition-all inline-flex items-center gap-2"
                    >
                        Explore Venues
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-4 py-16 max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-[#FBFAFF] rounded-2xl p-6 text-center border border-[#7C3AED]/10 hover:border-[#7C3AED]/20 transition-all">
                            <div className="text-4xl mb-3">{stat.icon}</div>
                            <div className="text-3xl font-bold text-[#23113F] mb-1">{stat.number}</div>
                            <div className="text-sm text-[#23113F]/60">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="px-4 py-16 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-[#FBFAFF] rounded-2xl p-8 border border-[#7C3AED]/10">
                        <div className="bg-[#7C3AED]/10 p-3 rounded-xl inline-block mb-4">
                            <Target className="w-6 h-6 text-[#7C3AED]" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-[#23113F]">Our Mission</h3>
                        <p className="text-[#23113F]/70 leading-relaxed">
                            To simplify venue discovery and booking through innovative technology,
                            transparent pricing, and exceptional customer service, making every event
                            memorable and stress-free.
                        </p>
                    </div>

                    <div className="bg-[#FBFAFF] rounded-2xl p-8 border border-[#7C3AED]/10">
                        <div className="bg-[#7C3AED]/10 p-3 rounded-xl inline-block mb-4">
                            <Eye className="w-6 h-6 text-[#7C3AED]" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-[#23113F]">Our Vision</h3>
                        <p className="text-[#23113F]/70 leading-relaxed">
                            To become India's most trusted venue booking platform, empowering millions
                            to find their perfect event spaces with confidence and ease.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="px-4 py-16 bg-gradient-to-br from-[#7C3AED]/10 via-[#F8F5FF] to-[#7C3AED]/10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="bg-[#7C3AED]/10 p-3 rounded-xl inline-block mb-4">
                            <Star className="w-6 h-6 text-[#7C3AED]" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-[#23113F]">Our Core Values</h2>
                        <p className="text-[#23113F]/70 max-w-2xl mx-auto">
                            The principles that guide everything we do at VenueAI
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <div key={index} className="bg-[#FBFAFF] rounded-2xl p-6 border border-[#7C3AED]/10 hover:border-[#7C3AED]/20 transition-all text-center">
                                <div className="bg-[#7C3AED]/10 p-3 rounded-xl inline-block mb-4">
                                    <div className="text-[#7C3AED]">{value.icon}</div>
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-[#23113F]">{value.title}</h3>
                                <p className="text-[#23113F]/70 text-sm">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Journey Timeline */}
            <section className="px-4 py-16 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="bg-[#7C3AED]/10 p-3 rounded-xl inline-block mb-4">
                        <Calendar className="w-6 h-6 text-[#7C3AED]" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-[#23113F]">Our Journey</h2>
                    <p className="text-[#23113F]/70 max-w-2xl mx-auto">
                        From a small idea to Bhopal's #1 venue discovery platform
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-[#7C3AED]/20 hidden md:block"></div>
                    <div className="space-y-8">
                        {milestones.map((milestone, index) => (
                            <div key={index} className={`flex flex-col md:flex-row items-center gap-6 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                <div className="flex-1 md:text-right">
                                    <div className="bg-[#FBFAFF] rounded-2xl p-6 border border-[#7C3AED]/10">
                                        <h3 className="text-xl font-bold text-[#23113F] mb-2">{milestone.title}</h3>
                                        <p className="text-[#23113F]/70">{milestone.description}</p>
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <div className="bg-[#7C3AED] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold">
                                        {milestone.year.slice(-2)}
                                    </div>
                                </div>
                                <div className="flex-1 md:text-left">
                                    <div className="text-2xl font-bold text-[#7C3AED]/30">{milestone.year}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="px-4 py-16 max-w-7xl mx-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="bg-[#7C3AED]/10 p-3 rounded-xl inline-block mb-4">
                            <Users className="w-6 h-6 text-[#7C3AED]" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-[#23113F]">Meet Our Team</h2>
                        <p className="text-[#23113F]/70 max-w-2xl mx-auto">
                            The passionate people behind VenueAI who work tirelessly to make your events special
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member, index) => (
                            <div key={index} className="bg-[#FBFAFF] rounded-2xl p-6 border border-[#7C3AED]/10 hover:border-[#7C3AED]/20 transition-all text-center">
                                <div className="text-6xl mb-4">{member.avatar}</div>
                                <h3 className="text-lg font-bold mb-1 text-[#23113F]">{member.name}</h3>
                                <p className="text-[#7C3AED] text-sm mb-3">{member.role}</p>
                                <p className="text-[#23113F]/70 text-sm">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="px-4 py-16 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="bg-[#7C3AED]/10 p-3 rounded-xl inline-block mb-4">
                        <Award className="w-6 h-6 text-[#7C3AED]" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-[#23113F]">Why Choose VenueAI?</h2>
                    <p className="text-[#23113F]/70 max-w-2xl mx-auto">
                        What makes us different from other venue booking platforms
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        'AI-powered venue recommendations',
                        'Verified venues with real photos',
                        'Transparent pricing with no hidden fees',
                        '24/7 customer support',
                        'Easy online booking process',
                        'Best price guarantee',
                        'Trusted by 10,000+ customers',
                        'Free venue consultation'
                    ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 bg-[#FBFAFF] rounded-xl p-4 border border-[#7C3AED]/10">
                            <CheckCircle className="w-5 h-5 text-[#7C3AED] flex-shrink-0" />
                            <span className="text-[#23113F]">{feature}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 py-16 max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-[#7C3AED]/20 to-[#7C3AED]/10 rounded-3xl p-12 text-center border border-[#7C3AED]/10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#23113F]">Ready to Find Your Perfect Venue?</h2>
                    <p className="text-[#23113F]/80 mb-8 max-w-2xl mx-auto">
                        Join thousands of happy customers who found their ideal event space with VenueAI
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => navigate('/services')}
                            className="bg-[#7C3AED] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#6D28D9] transition-all"
                        >
                            Explore Venues
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="bg-[#FBFAFF] text-[#7C3AED] px-8 py-3 rounded-xl font-semibold hover:bg-[#F3E8FF] transition-all border border-[#7C3AED]/20"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;