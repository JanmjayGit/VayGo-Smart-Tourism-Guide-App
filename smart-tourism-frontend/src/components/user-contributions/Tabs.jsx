export default function Tabs({ tabs, activeTab, setActiveTab, data }) {
    return (
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {tabs.map(tab => {
                const Icon = tab.icon;
                const count = data[tab.id]?.length;

                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg ${activeTab === tab.id ? 'bg-white shadow-sm' : ''
                            }`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                        {count > 0 && <span>{count}</span>}
                    </button>
                );
            })}
        </div>
    );
}