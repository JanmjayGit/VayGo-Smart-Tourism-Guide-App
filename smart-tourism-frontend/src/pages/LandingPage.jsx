import LandingNavbar from '../components/landing-page/LandingNavbar';
import HeroSection from '../components/landing-page/HeroSection';
import FeaturesSection from '../components/landing-page/FeaturesSection';
import PopularPlaces from '../components/landing-page/PopularPlaces';
import UpcomingEvents from '../components/landing-page/UpcomingEvents';
import PopularHotels from '../components/landing-page/PopularHotels';
import MapPreview from '../components/landing-page/MapPreview';
import WhyVayGo from '../components/landing-page/WhyVayGo';
import CTASection from '../components/landing-page/CTASection';
import LandingFooter from '../components/landing-page/LandingFooter';

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            <LandingNavbar />
            <HeroSection />
            <FeaturesSection />
            <PopularPlaces />
            <UpcomingEvents />
            <PopularHotels />
            <MapPreview />
            <WhyVayGo />
            <CTASection />
            <LandingFooter />
        </div>
    );
}
