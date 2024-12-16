import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/login");
  });
  return <h1>Sorry, but some error occurred.</h1>;
};

export default Unauthorized;
