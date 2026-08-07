import { Layout } from "antd";
import React, { FC } from "react";
import { useLocation } from "react-router-dom";

import AppFooter from "../../components/AppFooter";
import AppHeader from "../../components/AppHeader/AppHeader";

import "./MainLayout.less";

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  if (location.search === "?lite=true") {
    return <>{children}</>;
  }

  return (
    <Layout className="container">
      <AppHeader />
      <Layout.Content className="content">{children}</Layout.Content>
      <div className="footer">
        <AppFooter />
      </div>
    </Layout>
  );
};

export default MainLayout;