import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import UserTickets from "../pages/user/UserTickets";
import RootLayout from "../pages/layout/RootLayout";
import CreateUserTicket from "../pages/user/CreateUserTicket";
import BookingStock from "../pages/user/BookingStock";
import UserRootLayout from "../pages/layout/UserRootLayout";
import Unauthorized from "../components/Unauthorized";
import ViewTicketDetails from "../pages/user/ViewTicketDetails";
import StockFilter from "../pages/user/StockFilter";
import StockFilter1 from "../pages/user/StockFilter1";
import StockFilter2 from "../pages/user/StockFilter2";
import CreateDealer from "../pages/admin/CreateDealer";
import LandingPage from "../pages/landing/LandingPage";
import ContactUsPage from "../pages/landing/ContactUsPage";
import AboutUsPage from "../pages/landing/AboutUsPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="unauthorized" element={<Unauthorized />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="user" element={<UserRootLayout />}>
        <Route path=":user_id">
          <Route path="create_dealer" element={<CreateDealer />} />
          <Route path="tickets" element={<UserTickets />} />
                  <Route path="create_ticket" element={<CreateUserTicket />} />
                  <Route path="booking_stock" element={<BookingStock />} />
                  <Route path="stockfilter" element={<StockFilter />} />
                  <Route path="stockfilter1" element={<StockFilter1 />} />
                  <Route path="stockfilter2" element={<StockFilter2 />} />
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
