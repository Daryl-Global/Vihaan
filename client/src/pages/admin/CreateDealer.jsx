import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
// import { UserRoleContext } from "../../contexts/userRoleContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateDealer = () => {
  // const { userRole, setUserRole } = useContext(UserRoleContext);
  // console.log(userRole);
  const { user_id } = useParams();
  const [email, setEmail] = useState("");
  const [showDealers, setShowDealers] = useState(false);
  const [dealers, setDealers] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("role") !== "9087-t1-vaek-123-riop") {
      navigate(-1);
    }
  });

  const fetchDealers = async () => {
    setShowDealers(true);
    try {
      const res = await axios.get(
        `/api/admin/${user_id}/dealers`,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.data;
      setDealers(data.dealers);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `/api/admin/${user_id}/create_dealer`,
        { email: email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = res.data;
      if (data.status === 200) {
        toast.success(
          "User has successfully been assigned the role of dealer."
        );
      } else if (data.status === 501) {
        let a = data.text + ". Make sure user has registered.";
        toast.error(a);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-8 px-8">
      <div className="flex justify-center">
        <h2 className="text-3xl font-semibold text-gray-800">
          Assign Dealer Role
        </h2>
      </div>
      <p className="text-sm text-gray-600 text-center">
        Please add the email address of a <b>registered</b> user to assign the
        role of dealer.
      </p>
      <form className="mt-4">
        <div className="mb-2">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-800"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-slate-100 border border-black rounded-md focus:border-gray-500 focus:ring-gray-300 focus:border-none focus:ring focus:outline-none focus:ring-opacity-40"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
        >
          Assign Role
        </button>
      </form>
      <br />
      <div className="flex flex-col gap-2">
        <h2 className="block text-sm font-semibold text-gray-800">
          List of Dealers
        </h2>
        <button
          onClick={fetchDealers}
          className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
        >
          See all dealers
        </button>
        {showDealers && (
          <>
            <div className="bg-white shadow-md rounded-md">
              <table className="min-w-full divide-gray-200 table-layout-fixed">
                <colgroup>
                  <col className="w-1/2" />{" "}
                  {/* Adjust the width based on your preference */}
                  <col className="w-1/2" />{" "}
                  {/* Adjust the width based on your preference */}
                </colgroup>
                <thead className="bg-blue-50 sticky top-0">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                  </tr>
                </thead>
              </table>
              <div className="overflow-y-auto h-50">
                <table className="min-w-full divide-y divide-gray-200">
                  <colgroup>
                    <col className="w-1/2" />{" "}
                    {/* Adjust the width based on your preference */}
                    <col className="w-1/2" />{" "}
                    {/* Adjust the width based on your preference */}
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dealers.map((dealer) => (
                      <tr key={dealer.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {dealer.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {dealer.email}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="text-end">
              <h2 className="block text-md font-semibold text-gray-800">
                There are{" "}
                <span className="text-blue-300">{dealers.length}</span>{" "}
                dealers.
              </h2>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateDealer;
