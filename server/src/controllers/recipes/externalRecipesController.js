const asyncHandler = require("../../utils/asyncHandler");
const { searchMealsByName } = require("../../services/external/edamamService");

const searchExternalMeals = asyncHandler(async (req, res) => {
  const result = await searchMealsByName(req.query.name, {
    cuisineType: req.query.cuisineType,
    mealType: req.query.mealType,
    dishType: req.query.dishType,
    diet: req.query.diet,
    page: req.query.page,
    pageSize: req.query.pageSize
  });

  res.status(200).json({
    ok: true,
    source: "Edamam",
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: Math.ceil(result.total / result.pageSize),
    data: result.items
  });
});

module.exports = {
  searchExternalMeals
};
