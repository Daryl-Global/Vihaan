import React, { useState } from "react";

const TextModal = ({
  ticket,
  onClose,
  onAddMessage,
  textMessage,
  setTextMessage,
}) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}, ${hours}:${minutes}`;
  };

  const getRole = (role) => {
    if (role === "9087-t1-vaek-123-riop") {
            return "admin";
        } else if (role === "2069-t2-prlo-456-fiok") {
            return "dealer";
        } else if (role === "4032-t3-raek-789-chop") {
            return "user";
        }
        else if (role === "5001-t4-maek-101-znop") {
            return "manager";
        }
        else if (role === "6002-t5-saek-202-kiop") {
            return "supervisor";
        }
        else if (role === "7003-t6-laek-303-jiop") {
            return "analyst";
        }
  };
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none m-4">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none min-h-[80vh] max-h-[80vh]">
            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
              <h3 className="text-3xl font-semibold">Logs of ticket</h3>
            </div>
            <div className="relative p-4 flex-auto overflow-y-auto bg-slate-100 max-w-[calc(80vh-5rem)] max-h-[50vh]">
              <ul className="space-y-4 flex-col">
                {ticket.logs.map((log, index) => (
                  <li
                    key={index}
                    className={`${
                      log.userRole === "9087-t1-vaek-123-riop"
                        ? "text-blue-600"
                        : log.userRole === "2069-t2-prlo-456-fiok"
                        ? "text-black"
                        : "text-emerald-600 text-right"
                    }`}
                  >
                    {formatTimestamp(log.timestamp)} ({getRole(log.userRole)}){" "}
                    {log.message}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <input
                className="p-4 w-full border border-1 border-black"
                placeholder="Type something..."
                onChange={(e) => setTextMessage(e.target.value)}
                value={textMessage}
              />
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
              <button
                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => {
                  onAddMessage();
                  setTextMessage("");
                }}
              >
                Add message
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-60 fixed inset-0 z-40 bg-slate-900"></div>
    </>
  );
};

export default TextModal;
