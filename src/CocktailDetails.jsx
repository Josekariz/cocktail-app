import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Wine } from "lucide-react";

const CocktailDetails = () => {
  const { cocktailId } = useParams();
  const [cocktail, setCocktail] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCocktail(cocktailId);
  }, [cocktailId]);

  const fetchCocktail = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cocktail details");
      }

      const data = await response.json();
      const cocktailData = data.drinks?.[0];

      if (!cocktailData) {
        throw new Error("Cocktail not found");
      }

      setCocktail(cocktailData);

      // Extract ingredients and measures
      const ingredientsList = [];
      for (let i = 1; i <= 15; i++) {
        const ingredient = cocktailData[`strIngredient${i}`];
        const measure = cocktailData[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
          ingredientsList.push({
            ingredient,
            measure: measure?.trim() || "To taste",
            image: `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(
              ingredient
            )}-Small.png`,
          });
        }
      }
      setIngredients(ingredientsList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomCocktail = async () => {
    try {
      const response = await fetch(
        "https://www.thecocktaildb.com/api/json/v1/1/random.php"
      );
      const data = await response.json();
      const randomCocktail = data.drinks[0];
      setCocktail(randomCocktail);
      window.history.pushState(null, "", `/cocktail/${randomCocktail.idDrink}`);
    } catch (err) {
      setError("Failed to fetch random cocktail");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background-dark)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--gold-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background-dark)]">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-4">{error}</p>
          <Link
            to="/"
            className="text-[var(--gold-primary)] hover:text-[var(--gold-light)]"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!cocktail) return null;

  return (
    <div className="min-h-screen bg-[var(--background-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--gold-primary)]"
          >
            <ArrowLeft size={20} />
            Back to Cocktails
          </Link>
          <button
            onClick={fetchRandomCocktail}
            className="flex items-center gap-2 gold-gradient text-black px-4 py-2 rounded-lg hover:opacity-90 transition-all"
          >
            <Wine size={20} />
            Try Another Random Cocktail
          </button>
        </div>

        <div className="glass-panel">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={cocktail.strDrinkThumb}
                alt={cocktail.strDrink}
                className="w-full h-96 object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none"
              />
            </div>

            <div className="md:w-1/2 p-8">
              <div className="flex flex-wrap gap-3 mb-6">
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
                {cocktail.strGlass && (
                  <span className="px-3 py-1 rounded-full text-sm bg-[var(--background-card)] text-[var(--text-primary)]">
                    {cocktail.strGlass}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-6">
                {cocktail.strDrink}
              </h1>

              <div className="grid md:grid-cols-1 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                    Ingredients
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {ingredients.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-[var(--text-secondary)]"
                      >
                        <img
                          src={item.image}
                          alt={item.ingredient}
                          className="w-8 h-8 object-cover"
                        />
                        <div>
                          <div className="font-medium">{item.ingredient}</div>
                          <div className="text-sm opacity-75">
                            {item.measure}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                    Instructions
                  </h2>
                  <div className="prose max-w-none text-[var(--text-secondary)]">
                    {cocktail.strInstructions.split(".").map(
                      (instruction, index) =>
                        instruction.trim() && (
                          <p key={index} className="mb-4">
                            {instruction.trim() + "."}
                          </p>
                        )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CocktailDetails;
