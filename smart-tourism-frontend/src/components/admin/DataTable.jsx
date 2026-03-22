import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox } from 'lucide-react';

/**
 * Generic admin data table.
 *
 * @param {Object[]} columns - Array of { key, label, render?, sortable?, className? }
 * @param {Object[]} data - Row data array
 * @param {boolean} loading
 * @param {string} searchPlaceholder
 * @param {Function} onSearch - (searchTerm) => void
 * @param {number} page - Current page (0-indexed)
 * @param {number} totalPages
 * @param {Function} onPageChange - (newPage) => void
 * @param {React.ReactNode} filters - Optional filter elements to render
 */
export default function DataTable({
    columns = [],
    data = [],
    loading = false,
    searchPlaceholder = 'Search...',
    onSearch,
    page = 0,
    totalPages = 1,
    onPageChange,
    filters,
}) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (value) => {
        setSearchTerm(value);
        onSearch?.(value);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-72" />
                </div>
                <div className="rounded-lg border bg-white">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
                            {columns.map((_, j) => (
                                <Skeleton key={j} className="h-4 flex-1" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {onSearch && (
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                )}
                {filters}
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            {columns.map((col) => (
                                <TableHead key={col.key} className={`font-semibold text-slate-600 ${col.className || ''}`}>
                                    {col.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Inbox className="w-10 h-10" />
                                        <p className="text-sm">No data found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, idx) => (
                                <TableRow key={row.id || idx} className="hover:bg-slate-50/50">
                                    {columns.map((col) => (
                                        <TableCell key={col.key} className={col.className || ''}>
                                            {col.render ? col.render(row) : row[col.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && onPageChange && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Page {page + 1} of {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => onPageChange(0)}
                            disabled={page === 0}
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => onPageChange(totalPages - 1)}
                            disabled={page >= totalPages - 1}
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
