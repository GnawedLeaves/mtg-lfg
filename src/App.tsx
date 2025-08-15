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
import CardSearch from "./pages/CardSearch";
import ExpansionSets from "./pages/ExpansionSets";
import PopularCards from "./pages/PopularCards";
import LatestCards from "./pages/LatestCards";
import DeckList from "./pages/DeckList";
import DeckBuilder from "./pages/DeckBuilder";
import DeckView from "./pages/DeckView";
const { Header, Content } = Layout;

const AppContainer = styled.div`
  min-height: 100vh;
`;

function App() {
  const location = useLocation();
  const currentPath = location.pathname;

  const getSelectedKey = () => {
    if (currentPath === "/") return ["latest"];
    if (currentPath === "/search") return ["search"];
    if (currentPath === "/popular") return ["popular"];
    if (currentPath === "/latest") return ["latest"];
    if (currentPath === "/expansions") return ["expansions"];
    if (currentPath.startsWith("/decks")) return ["decks"];
    return ["latest"];
  };

  return (
    <AppContainer>
      <Layout>
        <Header>
          <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKey()}>
            <Menu.Item key="latest">
              <Link to="/">Latest Cards</Link>
            </Menu.Item>
            <Menu.Item key="expansions">
              <Link to="/expansions">Expansion Sets</Link>
            </Menu.Item>
            <Menu.Item key="search">
              <Link to="/search">Card Search</Link>
            </Menu.Item>
            <Menu.Item key="popular">
              <Link to="/popular">Popular Cards</Link>
            </Menu.Item>
            <Menu.Item key="decks">
              <Link to="/decks">My Decks</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "24px" }}>
          <Routes>
            <Route path="/" element={<LatestCards />} />
            <Route path="/latest" element={<LatestCards />} />
            <Route path="/search" element={<CardSearch />} />
            <Route path="/popular" element={<PopularCards />} />
            <Route path="/expansions" element={<ExpansionSets />} />
            <Route path="/decks" element={<DeckList />} />
            <Route path="/decks/create" element={<DeckBuilder />} />
            <Route path="/decks/:id" element={<DeckView />} />
            <Route path="/decks/:id/edit" element={<DeckBuilder />} />
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
