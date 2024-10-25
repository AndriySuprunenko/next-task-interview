'use client';

import React,{ useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface VehicleMake {
  MakeId: number;
  MakeName: string;
}

interface VehicleModel {
  Model_Name: string;
  Make_Name: string;
}

export default function HomePage() {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [filteredData, setFilteredData] = useState<VehicleModel[]>([]);

  // Years array from 2015 to the current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2014 }, (_, i) =>
    (2015 + i).toString()
  );

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await axios.get<{ Results: VehicleMake[] }>(
          `${process.env.NEXT_PUBLIC_VPIC_API_URL}/GetMakesForVehicleType/car?format=json`
        );
        setMakes(response.data.Results);
      } catch (error) {
        console.error('Error fetching vehicle makes:', error);
      }
    };
    fetchMakes();
  }, []);

  // Update selected make and makeId when a make is chosen
  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const makeName = e.target.value;
    setSelectedMake(makeName);
    const make = makes.find((m) => m.MakeName === makeName);
    setSelectedMakeId(make ? make.MakeId : null);
  };

  useEffect(() => {
    const fetchFilteredData = async () => {
      if (selectedMakeId && selectedYear) {
        try {
          const response = await axios.get<{ Results: VehicleModel[] }>(
            `${process.env.NEXT_PUBLIC_VPIC_API_URL}/GetModelsForMakeIdYear/makeId/${selectedMakeId}/modelyear/${selectedYear}?format=json`
          );
          setFilteredData(response.data.Results || []);
        } catch (error) {
          console.error('Error fetching vehicle models:', error);
        }
      } else {
        setFilteredData([]); // Clear the filtered data if no selection
      }
    };

    fetchFilteredData();
  }, [selectedMakeId, selectedYear]);

  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      <h1 className='text-4xl font-bold mb-6 text-center'>
        Vehicle Filter Page
      </h1>

      {/* Vehicle Make Selector */}
      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Select Vehicle Make</label>
        <select
          value={selectedMake}
          onChange={handleMakeChange}
          className='w-full p-2 border rounded-lg bg-white shadow'
        >
          <option value=''>-- Select Make --</option>
          {makes.map((make) => (
            <option key={make.MakeId} value={make.MakeName}>
              {make.MakeName}
            </option>
          ))}
        </select>
      </div>

      {/* Model Year Selector */}
      <div className='mb-8'>
        <label className='block font-semibold mb-2'>Select Model Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className='w-full p-2 border rounded-lg bg-white shadow'
        >
          <option value=''>-- Select Year --</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Display Filtered Data */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div
              key={item.Model_Name}
              className='p-4 bg-white shadow rounded-lg'
            >
              <h2 className='text-2xl font-bold mb-2'>{item.Model_Name}</h2>
              <p className='text-gray-500'>Make: {item.Make_Name}</p>
            </div>
          ))
        ) : (
          <p>No models found.</p>
        )}
      </div>

      {/* Next Button */}
      <div className='flex justify-center'>
        <Link href={`/result/${selectedMakeId}/${selectedYear}`} passHref>
          <button
            disabled={!selectedMakeId || !selectedYear}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors duration-200
                        ${
                          selectedMakeId && selectedYear
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
          >
            Next
          </button>
        </Link>
      </div>
    </div>
  );
}
