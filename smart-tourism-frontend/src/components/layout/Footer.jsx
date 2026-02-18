import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-gray-50 mt-auto">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-teal-600">TravelBuddy</h3>
                        <p className="text-sm text-gray-600">
                            Discover amazing destinations and create unforgettable memories with our comprehensive tourism platform.
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/about" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/places" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                                    Places
                                </Link>
                            </li>
                            <li>
                                <Link to="/events" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link to="/emergency" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                                    Emergency Services
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/help" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <a href="mailto:support@smarttourism.com" className="hover:text-teal-600 transition-colors">
                                    support@smarttourism.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <a href="tel:+1234567890" className="hover:text-teal-600 transition-colors">
                                    +1 (234) 567-890
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Copyright */}
                <div className="text-center text-sm text-gray-600">
                    <p>&copy; {currentYear} TravelBuddy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
