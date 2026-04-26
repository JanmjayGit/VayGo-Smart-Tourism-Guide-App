const AMENITIES = [
    'WiFi', 'Parking', 'Air Conditioning', 'Swimming Pool',
    'Breakfast', 'Room Service', 'Gym', 'Spa',
    'Restaurant', 'Bar', 'Business Center', 'Laundry',
    'Pet Friendly', 'Rooftop Terrace', '24hr Front Desk', 'Airport Shuttle',
];

export default function AmenitiesSelector({ selected = [], onChange }) {
    const toggle = (amenity) => {
        const updated = selected.includes(amenity)
            ? selected.filter((x) => x !== amenity)
            : [...selected, amenity];
        onChange(updated);
    };

    return (
        <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">
                Amenities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {AMENITIES.map((a) => (
                    <button type="button" key={a} onClick={() => toggle(a)}
                        className={`px-3 py-2 rounded-lg border text-sm transition ${selected.includes(a)
                                ? 'bg-indigo-50 text-black border-indigo-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                            }`}>
                        {a}
                    </button>
                ))}
            </div>
        </section>
    );
}