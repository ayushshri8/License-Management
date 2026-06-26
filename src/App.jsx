import AppRoutes        from "./Routes/AppRoutes";
import { ThemeProvider } from "./Components/ThemeContext";
import SessionProvider  from "./Components/SessionProvider";

function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
