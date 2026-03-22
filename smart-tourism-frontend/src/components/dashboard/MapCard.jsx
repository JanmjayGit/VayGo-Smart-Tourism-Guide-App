import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, Maximize2 } from 'lucide-react';
import MapView from '@/components/map/MapView';

export default function MapCard() {
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState({ lat: 30.7333, lng: 76.7794 }); // Default to Chandigarh/Kharar roughly
    const [cityBadge, setCityBadge] = useState('Kharar, Punjab');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => { console.log("Geolocation denied or failed, using default."); }
            );
        }
    }, []);

    return (
        <div className="relative w-full min-h-[300px] h-full sm:h-[400px] rounded-2xl overflow-hidden shadow-xl border border-white/40 bg-white/20 group">

            {/* Map Container */}
            <div className="absolute inset-0">
                <MapView
                    center={userLocation}
                    zoom={13}
                    height="100%"
                    showInfoWindows={false}
                />
            </div>

            {/* Top Left Frosted Badge */}
            <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/70 backdrop-blur-md rounded-full shadow-md text-sm font-semibold text-slate-800 border border-white/50 backdrop-saturate-150">
                {cityBadge}
            </div>

            {/* Bottom Dark Gradient Overlay */}
            <div className="absolute bottom-0 w-full h-32 bg-linear-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* Bottom Content Area */}
            <div className="absolute bottom-0 w-full p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10">
                <div className="flex items-center gap-2 text-white">
                    <MapIcon className="w-6 h-6" />
                    <h3 className="font-playfair text-2xl font-bold tracking-wide shadow-black/50 drop-shadow-lg">Explore Map</h3>
                </div>

                <button
                    onClick={() => navigate('/map')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1a2b38] rounded-full font-semibold text-sm hover:bg-teal-50! hover:text-teal-700 transition-all shadow-lg active:scale-95"
                >
                    <Maximize2 className="w-4 h-4" />
                    Full Map
                </button>
            </div>
        </div>
    );
}
