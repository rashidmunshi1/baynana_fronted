
import NotFound from "./Components/NotFound";
import HomePage from "./DesignLayout/HomePage";
import { CategoryTable } from "./Pages/Category";
import ProductsPage from "./Pages/ProductsPage";


const AdminRoutes = [
      {
    path : "/",
    name : "Home", 
    component : HomePage,
   },
   {
      path : "/products",
      name : "Products",
      component : ProductsPage,
    },
    {
      path : "/categorys",
      name : "Category",
      component : CategoryTable,
    },
    


   { path: "*", name: 'Not Found', component: NotFound },
];

export { AdminRoutes };
