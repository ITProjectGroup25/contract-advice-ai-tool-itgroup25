"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";

export const SAMPLE_GRANT_FORM_URL = "https://five-crush-16865804.figma.site/";

function SearchBar({ onSearch }: { onSearch: (value: string) => void }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (!newValue.trim()) {
      onSearch(""); // Clear results if input is empty
      return;
    }

    // Start loading
    setLoading(true);
    onSearch(""); // Clear current results while loading

    setTimeout(() => {
      onSearch(newValue);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="w-full relative">
      <Input
        value={value}
        onChange={handleChange}
        className="h-16 text-lg pr-12"
        placeholder="Search for a grant case"
      />

      {loading ? (
        <FaSpinner
          size={18}
          className="text-gray-400 animate-spin absolute right-8 top-6"
        />
      ) : (
        <FaSearch size={18} className="text-gray-400 absolute right-8 top-6" />
      )}
    </div>
  );
}

const CommunityShowcase = () => {
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Fake results (could be replaced with API data later)
    const fakeResults = Array.from(
      { length: 5 },
      (_, i) => `${query} grant case result #${i + 1}`
    );
    setResults(fakeResults);
  };

  return (
    <section
      style={{ maxWidth: "1280px" }}
      className="flex flex-col items-center py-16 mx-auto rounded-xl lg:px-32 lg:pb-24 lg:pt-32"
    >
      <h2 className="text-3xl font-bold text-center lg:text-5xl text-black">
        Look for a grant case questionnaire
      </h2>

      <div className="my-8" />

      <SearchBar onSearch={handleSearch} />

      {results.length > 0 && (
        <div className="mt-6 w-full max-w-2xl space-y-3">
          <p className="text-gray-600">Showing results:</p>
          {results.map((res, idx) => (
            <div
              key={idx}
              className="p-4 cursor-pointer border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition"
            >
              <a href={SAMPLE_GRANT_FORM_URL}>
                <p className="text-black font-medium">{res}</p>
                <p className="text-sm text-gray-500">🔍 Example grant form</p>
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CommunityShowcase;
