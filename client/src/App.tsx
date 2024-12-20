import Header from "./components/Header.tsx";
import { Route, Routes } from "react-router-dom";
import routes from "./config/router";
import Footer from "./components/Footer.tsx";

export default function App() {
  return (
    <div className="min-h-fit">
      <Header />
      <div className="col-span-5">
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
