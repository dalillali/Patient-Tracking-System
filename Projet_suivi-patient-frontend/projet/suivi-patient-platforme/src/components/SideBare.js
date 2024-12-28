import React  from "react";
import { useNavigate } from "react-router-dom";
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from "cdbreact";
import {CardMedia} from "@mui/material";
import { NavLink } from "react-router-dom";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Logo from './assets/loogo.png';


const SideBare = () => {
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        position: "fixed",
        zIndex: "9999",
        overflow: "scroll initial"
      }}
    >
      <CDBSidebar textColor="#fff" backgroundColor="#333">
        <CDBSidebarHeader>
        <CardMedia component="img"  image={Logo} alt="Logo" />
        </CDBSidebarHeader>

        <CDBSidebarContent className="sidebar-content">
          <CDBSidebarMenu>
          <NavLink exact to="/Aceuill" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="home">Home</CDBSidebarMenuItem>
          </NavLink>

          <NavLink exact to="/patients" activeClassName="activeClicked">
  <CDBSidebarMenuItem icon="users">Patients</CDBSidebarMenuItem>
</NavLink>

                

          </CDBSidebarMenu>
        </CDBSidebarContent>

        <CDBSidebarFooter style={{ textAlign: "center" }}>
          <div style={{ padding: "20px 5px" }}>
            <button onClick={handleLogout} style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  );
};

export default SideBare;
