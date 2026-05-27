import React from "react";

import AppRoutes from "./routes/AppRoutes";
import {Provider} from "react-redux";
import {store} from "./store";

export function App() {
  return (
    <Provider store={store}>
      <AppRoutes/>
    </Provider>
  );
}

export default App;
