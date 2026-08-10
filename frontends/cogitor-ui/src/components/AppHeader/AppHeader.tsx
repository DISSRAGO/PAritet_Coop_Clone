// /src/components/AppHeader/AppHeader.tsx
import { MenuOutlined } from "@ant-design/icons";
import { Drawer, Layout, Row } from "antd";
import React, { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

import HeaderMenuItems from "./HeaderMenuItems";

const AppHeader: FC = () => {
    // Реальный детект мобилки по ширине экрана
    const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
    const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);

    const showDrawer = () => {
        setMenuDrawerVisible(true);
    };

    const onClose = () => {
        setMenuDrawerVisible(false);
    };

    return (
      <Layout.Header
          className="app-header"
          style={{
              padding: "0 24px",
              background: "#ffffff",
              borderBottom: "1px solid #f0f0f0",
          }}
      >
          <Row justify="space-between" align="middle" wrap={false}>
              <Row align="middle" wrap={false}>
                  <Link
                      to="/"
                      className="app-header__logo"
                      style={{ fontWeight: 600, fontSize: 18, color: "#1890ff" }}
                  >
                      КОГИТЕКА
                  </Link>
              </Row>

              {isMobile ? (
                  <>
                      <MenuOutlined
                          className="app-header__menu-icon"
                          style={{ fontSize: 20, cursor: "pointer", color: "#000" }}
                          onClick={showDrawer}
                      />
                      <Drawer
                          title="Меню"
                          placement="right"
                          closable
                          onClose={onClose}
                          open={menuDrawerVisible}
                          bodyStyle={{ padding: 0 }}
                      >
                          <HeaderMenuItems />
                      </Drawer>
                  </>
              ) : (
                  <HeaderMenuItems />
              )}
          </Row>
      </Layout.Header>
  );
};

export default AppHeader;