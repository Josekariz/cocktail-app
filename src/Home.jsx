import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Wine, Calendar } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    alcoholic: searchParams.get("alcoholic") || "",
    glass: searchParams.get("glass") || "",
    category: searchParams.get("category") || "",
  });

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [glassTypes, setGlassTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cocktailOfDay, setCocktailOfDay] = useState(null);

  // Update URL when filters change
  const updateURLParams = useCallback((newFilters, newSearch) => {
    const params = new URLSearchParams();

    if (newSearch) params.set("search", newSearch);
    if (newFilters.category) params.set("category", newFilters.category);
    if (newFilters.glass) params.set("glass", newFilters.glass);
    if (newFilters.alcoholic) params.set("alcoholic", newFilters.alcoholic);

    setSearchParams(params);
  }, [setSearchParams]);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [glassRes, categoryRes] = await Promise.all([
          fetch("https://thecocktaildb.com/api/json/v1/1/list.php?g=list"),
          fetch("https://thecocktaildb.com/api/json/v1/1/list.php?c=list"),
        ]);

        if (!glassRes.ok || !categoryRes.ok) {
          throw new Error("Failed to fetch filter options");
        }

        const glassData = await glassRes.json();
        const categoryData = await categoryRes.json();

        setGlassTypes(glassData.drinks || []);
        setCategories(categoryData.drinks || []);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        setError("Failed to load filter options");
      }
    };

    fetchFilterOptions();
  }, []);

  // Modified search function
  const getCocktails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url;

      if (search) {
        url = `https://thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(search)}`;
      } else if (filters.alcoholic) {
        url = `https://thecocktaildb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(filters.alcoholic)}`;
      } else if (filters.category) {
        url = `https://thecocktaildb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(filters.category)}`;
      } else if (filters.glass) {
        url = `https://thecocktaildb.com/api/json/v1/1/filter.php?g=${encodeURIComponent(filters.glass)}`;
      } else {
        url = "https://thecocktaildb.com/api/json/v1/1/search.php?f=a";
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch cocktails");
      }

      const data = await response.json();

      if (!data.drinks) {
        setCocktails([]);
        setError("No cocktails found");
      } else {
        setCocktails(data.drinks);
      }
    } catch (error) {
      console.error("Error fetching cocktails:", error);
      setError("Failed to load cocktails");
      setCocktails([]);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    getCocktails();
  }, [getCocktails]);

  // Modified update handlers to maintain URL state
  const updateSearch = (e) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    const newFilters = { ...filters, alcoholic: "", glass: "", category: "" };
    setFilters(newFilters);
    updateURLParams(newFilters, newSearch);
  };

  const handleFilterChange = (type, value) => {
    let newFilters = {
      alcoholic: "",
      glass: "",
      category: ""
    };

    // Set the selected filter, reset others
    newFilters[type] = value;

    setFilters(newFilters);
    setSearch("");  // Clear search when filtering
    updateURLParams(newFilters, "");  // Update URL with new filters
  };

  const fetchCocktailOfDay = async () => {
    try {
      const today = new Date().toDateString();
      const storedCocktail = localStorage.getItem("cocktailOfDay");
      const storedDate = localStorage.getItem("cocktailOfDayDate");

      if (storedCocktail && storedDate === today) {
        setCocktailOfDay(JSON.parse(storedCocktail));
      } else {
        const response = await fetch(
          "https://www.thecocktaildb.com/api/json/v1/1/random.php"
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch cocktail of the day");
        }

        const data = await response.json();
        if (data.drinks && data.drinks[0]) {
          const newCocktailOfDay = data.drinks[0];
          setCocktailOfDay(newCocktailOfDay);
          localStorage.setItem("cocktailOfDay", JSON.stringify(newCocktailOfDay));
          localStorage.setItem("cocktailOfDayDate", today);
        }
      }
    } catch (error) {
      console.error("Error fetching cocktail of the day:", error);
    }
  };

  useEffect(() => {
    fetchCocktailOfDay();
  }, []);

  const fetchRandomCocktailAndNavigate = async () => {
    try {
      const response = await fetch(
        "https://www.thecocktaildb.com/api/json/v1/1/random.php"
      );
      const data = await response.json();
      if (data.drinks && data.drinks[0]) {
        navigate(`/cocktail/${data.drinks[0].idDrink}`);
      }
    } catch (error) {
      console.error("Error fetching random cocktail:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-dark)]">
      <header className="glass-panel mb-8">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <button
              onClick={fetchRandomCocktailAndNavigate}
              className="flex items-center gap-2 gold-gradient text-black px-4 py-2 rounded-lg hover:opacity-90 transition-all"
            >
              <Wine size={20} />
              Random Cocktail
            </button>

            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  className="w-full px-4 py-2 bg-[var(--background-card)] border border-[var(--gold-primary)] rounded-lg focus:ring-2 focus:ring-[var(--gold-light)] focus:border-transparent"
                  type="text"
                  value={search}
                  onChange={updateSearch}
                  placeholder="Search cocktails..."
                />
                <Search
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gold-primary)]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                onChange={(e) => handleFilterChange("category", e.target.value)}
                value={filters.category}
                className="px-4 py-2 bg-[var(--background-card)] border border-[var(--gold-primary)] rounded-lg focus:ring-2 focus:ring-[var(--gold-light)]"
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option
                    key={category.strCategory}
                    value={category.strCategory}
                  >
                    {category.strCategory}
                  </option>
                ))}
              </select>

              <select
                onChange={(e) => handleFilterChange("glass", e.target.value)}
                value={filters.glass}
                className="px-4 py-2 bg-[var(--background-card)] border border-[var(--gold-primary)] rounded-lg focus:ring-2 focus:ring-[var(--gold-light)]"
              >
                <option value="">All Glasses</option>
                {Array.isArray(glassTypes) && glassTypes.map((glass) => (
                  <option key={glass.strGlass} value={glass.strGlass}>
                    {glass.strGlass}
                  </option>
                ))}
              </select>

              <select
                onChange={(e) =>
                  handleFilterChange("alcoholic", e.target.value)
                }
                value={filters.alcoholic}
                className="px-4 py-2 bg-[var(--background-card)] border border-[var(--gold-primary)] rounded-lg focus:ring-2 focus:ring-[var(--gold-light)]"
              >
                <option value="">All Types</option>
                <option value="Alcoholic">Alcoholic</option>
                <option value="Non_Alcoholic">Non-Alcoholic</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="text-red-500 text-center mb-4 p-4 bg-red-100 rounded">
            {error}
          </div>
        )}
        
        {cocktailOfDay && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={24} className="text-[var(--gold-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Cocktail of the Day
              </h2>
            </div>
            <Link to={`/cocktail/${cocktailOfDay.idDrink}`}>
              <div className="glass-panel hover-scale card-shadow">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img
                      src={cocktailOfDay.strDrinkThumb}
                      alt={cocktailOfDay.strDrink}
                      className="w-full h-72 md:h-96 object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <h3 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">
                      {cocktailOfDay.strDrink}
                    </h3>
                    <div className="flex gap-2 mb-4">
                      {cocktailOfDay.strCategory && (
                        <span className="px-3 py-1 rounded-full text-sm bg-[var(--gold-primary)] text-black">
                          {cocktailOfDay.strCategory}
                        </span>
                      )}
                      {cocktailOfDay.strAlcoholic && (
                        <span className="px-3 py-1 rounded-full text-sm bg-[var(--red-accent)] text-white">
                          {cocktailOfDay.strAlcoholic}
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--text-secondary)] line-clamp-4 mb-4">
                      {cocktailOfDay.strInstructions}
                    </p>
                    <span className="inline-block text-[var(--gold-primary)] hover:text-[var(--gold-light)]">
                      View Full Recipe →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse glass-panel h-96"></div>
            ))
          ) : Array.isArray(cocktails) && cocktails.length > 0 ? (
            cocktails.map((cocktail) => (
              <Link to={`/cocktail/${cocktail.idDrink}`} key={cocktail.idDrink}>
                <div className="glass-panel hover-scale card-shadow h-full">
                  <div className="relative h-48">
                    <img
                      src={cocktail.strDrinkThumb}
                      alt={cocktail.strDrink}
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="font-bold text-xl mb-2 text-[var(--text-primary)]">
                      {cocktail.strDrink}
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                      {cocktail.strCategory && (
                        <span className="px-3 py-1 rounded-full text-sm bg-[var(--gold-primary)] text-black">
                          {cocktail.strCategory}
                        </span>
                      )}
                      {cocktail.strAlcoholic && (
                        <span className="px-3 py-1 rounded-full text-sm bg-[var(--red-accent)] text-white">
                          {cocktail.strAlcoholic}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-[var(--text-secondary)]">
              {error || "No cocktails found"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;