import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchAPI } from '../services/api';
import { normalizeVenueResults } from '../utils/venues';

const Search = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const query = new URLSearchParams(useLocation().search).get('q');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await searchAPI.searchVenues({ q: query });
                setResults(normalizeVenueResults(res));
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        if (query) fetchData();
    }, [query]);

    return (
        <div className="min-h-screen bg-[#F8F5FF] p-6 text-[#23113F]">
            <h2 className="text-2xl font-bold mb-4 text-[#23113F]">
                Results for "{query}"
            </h2>

            {loading ? (
                <p className="text-[#23113F]/70">Loading...</p>
            ) : results.length === 0 ? (
                <p className="text-[#23113F]/70">No venues found</p>
            ) : (
                <div className="grid md:grid-cols-3 gap-4">
                    {results.map((venue) => (
                        <div key={venue._id || venue.id} className="p-4 bg-[#FBFAFF] rounded-lg border border-[#7C3AED]/10 hover:border-[#7C3AED]/20 transition-all">
                            <h3 className="text-lg font-semibold text-[#23113F]">{venue.title || venue.name}</h3>
                            <p className="text-[#23113F]/70">{venue.category}</p>
                            <p className="text-sm text-[#23113F]/60">{venue.location}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
