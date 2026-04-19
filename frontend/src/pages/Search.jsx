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
        <div className="p-6 text-white">
            <h2 className="text-2xl mb-4">
                Results for "{query}"
            </h2>

            {loading ? (
                <p>Loading...</p>
            ) : results.length === 0 ? (
                <p>No venues found</p>
            ) : (
                <div className="grid md:grid-cols-3 gap-4">
                    {results.map((venue) => (
                        <div key={venue._id || venue.id} className="p-4 bg-white/5 rounded-lg">
                            <h3 className="text-lg font-semibold">{venue.title || venue.name}</h3>
                            <p className="text-gray-400">{venue.category}</p>
                            <p className="text-sm text-gray-500">{venue.location}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
