import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";
import { Layout, Menu } from "antd";
import styled from "styled-components";
import CardSearch from "./CardSearch";
import PopularCards from "./PopularCards";
import ExpansionSets from "./ExpansionSets";
const { Header, Content } = Layout;

const AppContainer = styled.div`
  min-height: 100vh;
`;

function App() {
  const location = useLocation();
  const currentPath = location.pathname;

  const getSelectedKey = () => {
    if (currentPath === "/") return ["search"];
    if (currentPath === "/popular") return ["popular"];
    if (currentPath === "/expansions") return ["expansions"];
    return ["search"];
  };

  return (
    <AppContainer>
      <Layout>
        <Header>
          <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKey()}>
            <Menu.Item key="search">
              <Link to="/">Card Search</Link>
            </Menu.Item>
            <Menu.Item key="popular">
              <Link to="/popular">Popular Cards</Link>
            </Menu.Item>
            <Menu.Item key="expansions">
              <Link to="/expansions">Expansion Sets</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "24px" }}>
          <Routes>
            <Route path="/" element={<CardSearch />} />
            <Route path="/popular" element={<PopularCards />} />
            <Route path="/expansions" element={<ExpansionSets />} />
          </Routes>
        </Content>
      </Layout>
    </AppContainer>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;
