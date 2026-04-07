export const appSections = [
  {
    key: "home",
    label: "Inicio",
    icon: "home-outline"
  },
  {
    key: "search",
    label: "Recetario KitchenKnot",
    icon: "search-outline",
    quickAccessColor: "#efe5d0",
    description: "Explora nuestro recetario KitchenKnot a recetas externas."
  },
  {
    key: "userRecipes",
    label: "Recetas de usuarios",
    icon: "people-outline",
    quickAccessColor: "#efe5d0",
    description: "Consulta las recetas compartidas por otros usuarios de la comunidad."
  },
  {
    key: "favorites",
    label: "Recetas favoritas",
    icon: "heart-outline",
    quickAccessColor: "#efe5d0",
    description: "Consulta tus recetas guardadas."
  },
  {
    key: "shopping",
    label: "Listas de la compra",
    icon: "cart-outline",
    quickAccessColor: "#efe5d0",
    description: "Organiza y prepara tus compras."
  },
  {
    key: "myRecipes",
    label: "Mis recetas",
    icon: "book-outline",
    quickAccessColor: "#efe5d0",
    description: "Revisa tu rincón de recetas."
  },
  {
    key: "profile",
    label: "Perfil",
    icon: "person-outline",
    quickAccessColor: "#efe5d0",
    description: "Consulta los datos de tu perfil."
  }
];

export const quickAccessSections = appSections.filter((section) => section.key !== "home");
