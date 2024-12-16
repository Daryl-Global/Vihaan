import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import UserTickets from "../pages/user/UserTickets";
import RootLayout from "../pages/layout/RootLayout";
import CreateUserTicket from "../pages/user/CreateUserTicket";
import BookingMaster from "../pages/user/BookingMaster";
import ExecutiveMaster from "../pages/user/ExecutiveMaster";
import LocationMaster from "../pages/user/LocationMaster";
import VehicleMaster from "../pages/user/VehicleMaster";
import CustomerMaster from "../pages/user/CustomerMaster";
import CreateGatePass from "../pages/user/CreateGatePass";
import UserRootLayout from "../pages/layout/UserRootLayout";
import Unauthorized from "../components/Unauthorized";
import ViewTicketDetails from "../pages/user/ViewTicketDetails";
import StockFilter from "../pages/user/StockFilter";
import StockFilter1 from "../pages/user/StockFilter1";
import AtAGlance from "../pages/user/AtAGlance";
import CreateDealer from "../pages/admin/CreateDealer";
import LandingPage from "../pages/landing/LandingPage";
import ContactUsPage from "../pages/landing/ContactUsPage";
import AboutUsPage from "../pages/landing/AboutUsPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Login />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="unauthorized" element={<Unauthorized />} />
      <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="user" element={<UserRootLayout />}>
        <Route path=":user_id">
          <Route path="create_dealer" element={<CreateDealer />} />
          <Route path="tickets" element={<UserTickets />} />
                  <Route path="create_ticket" element={<CreateUserTicket />} />
                  <Route path="create_gate_pass" element={<CreateGatePass />} />
                  <Route path="Customer_Master" element={<CustomerMaster />} />
                  <Route path="booking_master" element={<BookingMaster />} />
                  <Route path="executive_master" element={<ExecutiveMaster />} />
                  <Route path="location_master" element={<LocationMaster />} />
                  <Route path="vehicle_master" element={<VehicleMaster />} />
                  <Route path="stockfilter" element={<StockFilter />} />
                  <Route path="stockfilter1" element={<StockFilter1 />} />
                  <Route path="at_a_glance" element={<AtAGlance />} />
          <Route
            path="ticket_details/:ticket_id"
            element={<ViewTicketDetails />}
          />
        </Route>
      </Route>
    </Route>
  )
);

export default router;
