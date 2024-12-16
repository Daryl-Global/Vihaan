import React, { createContext, useState } from "react";

const UserRoleContext = createContext();

const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState();
  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export { UserRoleContext, UserProvider };
