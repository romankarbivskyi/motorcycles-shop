import Nav from "./components/Nav.tsx";
import { Route, Routes } from "react-router-dom";
import routes from "./config/router";

export default function App() {
  return (
    <div>
      <Nav />
      <div className="col-span-5">
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </div>
    </div>
  );
}
