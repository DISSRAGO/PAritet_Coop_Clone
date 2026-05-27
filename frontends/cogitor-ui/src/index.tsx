import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';

//import "./themes/index.less";
// import 'antd/dist/reset.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
console.log(root);
root.render(
  //<React.StrictMode>
      <App />
  //</React.StrictMode>
);

