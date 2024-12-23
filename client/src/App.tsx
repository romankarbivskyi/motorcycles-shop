import { Route, Routes } from "react-router-dom";
import routes from "./config/router";
import RootLayout from "./layouts/RootLayout.tsx";

export default function App() {
  return (
    <div>
      <RootLayout>
        <div className="min-h-screen">
          <Routes>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </div>
      </RootLayout>
    </div>
  );
}
