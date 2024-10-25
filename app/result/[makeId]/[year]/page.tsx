'use client';

import React, { useEffect, useState } from 'react';
import Loader from '../../../components/Loader'; // Import the Loader component

interface VehicleModel {
  Model_Name: string;
  Make_Name: string;
}

interface Params {
    makeId: string;
    year: string;
}

const fetchVehicleModels = async (
  makeId: string,
  year: string
): Promise<VehicleModel[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_VPIC_API_URL}/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}?format=json`
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.Results || [];
};

const ResultPage = ({ params }: { params: Params }) => {
    const { makeId, year } = params; // Now TypeScript knows the shape of params
    const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const models = await fetchVehicleModels(makeId, year);
                setVehicleModels(models);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [makeId, year]);

    if (loading) {
        return <Loader />; // Render the Loader component while loading
    }

    return (
        <div className="p-4">
            {error && <p className="text-red-500">{error}</p>}
            <h1 className="text-2xl font-bold mb-4">
                Vehicle Models for Make ID: {makeId} in {year}
            </h1>
            <React.Suspense fallback={<Loader />}>
                {vehicleModels.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {vehicleModels.map((model) => (
                            <li key={model.Model_Name} className="mb-2">
                                {model.Model_Name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No models found.</p>
                )}
            </React.Suspense>
        </div>
    );
};

export default ResultPage;
