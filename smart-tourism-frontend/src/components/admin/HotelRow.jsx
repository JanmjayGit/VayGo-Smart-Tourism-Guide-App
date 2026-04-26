import { useNavigate } from 'react-router-dom';
import { Hotel, CheckCircle2, XCircle, Trash2, Loader2, MapPin, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/admin/StatusBadge';

export default function HotelRow({ hotel, onVerify, onReject, onDelete, verifying, onEdit }) {
    const navigate = useNavigate();
    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {hotel.imageUrl
                            ? <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                            : <Hotel className="w-5 h-5 text-slate-400 m-auto mt-2.5" />}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">{hotel.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{hotel.city || '—'}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{hotel.city || '—'}</td>
            <td className="px-4 py-3 text-sm text-slate-700 font-medium">
                {hotel.pricePerNight ? `₹${Number(hotel.pricePerNight).toLocaleString('en-IN')}` : '—'}
            </td>
            <td className="px-4 py-3"><StatusBadge verified={hotel.verified} /></td>
            <td className="px-4 py-3 text-xs text-slate-500">{hotel.submittedByUsername || 'Admin'}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    {!hotel.verified && (
                        <Button size="sm" className="h-7 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                            onClick={() => onVerify(hotel.id)} disabled={verifying === hotel.id}>
                            {verifying === hotel.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <><CheckCircle2 className="w-3 h-3 mr-1" />Approve</>}
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-700 hover:text-white"
                        onClick={() => onEdit(hotel)}>
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline"
                        className="h-7 px-2.5 text-xs border-slate-200 text-white bg-indigo-600 hover:bg-indigo-600"
                        onClick={() => navigate(`/hotels/${hotel.id}`)}>
                        View
                    </Button>
                    <Button size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => !hotel.verified ? onReject(hotel.id) : onDelete(hotel.id)}
                        title={!hotel.verified ? 'Reject submission' : 'Delete hotel'}>
                        {!hotel.verified ? <XCircle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                </div>
            </td>
        </tr>
    );
}