import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Field({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    required,
    placeholder,
    prefix
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm text-gray-700 flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </Label>

            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {prefix}
                    </span>
                )}

                <Input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`${prefix ? 'pl-7' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}