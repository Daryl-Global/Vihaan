import React, { useState } from "react";
const Autocomplete = (props) => {
  const [active, setActive] = useState(0);
  const [filtered, setFiltered] = useState([]);
  const [isShow, setIsShow] = useState(false);
  const [input, setInput] = useState("");

  const onChange = (e) => {
    const { suggestions } = props;
    const input = e.currentTarget.value;
    const newFilteredSuggestions = suggestions
      .filter(
        (suggestion) =>
          suggestion[0].toLowerCase().indexOf(input.toLowerCase()) > -1
      )
      .map((suggestion) => suggestion[0]);
    setActive(0);
    setFiltered(newFilteredSuggestions);
    setIsShow(true);
    setInput(e.currentTarget.value);
  };
  const onClick = (e) => {
    setActive(0);
    setFiltered([]);
    setIsShow(false);
    setInput(e.currentTarget.innerText);

    const selectedDealer = props.suggestions.find(
      (suggestion) => suggestion[0] === e.currentTarget.innerText
    );

    // Extract the userId from the selected dealer array
    // const selectedUserId = selectedDealer[1] || null;

    // Call the setDealerId function passed from the parent component
    props.setDealerId(selectedDealer);
  };
  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      // enter key
      setActive(0);
      setIsShow(false);
      setInput(filtered[active]);
    } else if (e.keyCode === 38) {
      // up arrow
      return active === 0 ? null : setActive(active - 1);
    } else if (e.keyCode === 40) {
      // down arrow
      return active - 1 === filtered.length ? null : setActive(active + 1);
    }
  };
  const renderAutocomplete = () => {
    if (isShow && input) {
      if (filtered.length) {
        return (
          <ul className="autocomplete cursor-pointer">
            {filtered.map((suggestion, index) => {
              let className;
              if (index === active) {
                className = "active";
              }
              return (
                <li className={className} key={suggestion} onClick={onClick}>
                  {suggestion}
                </li>
              );
            })}
          </ul>
        );
      } else {
        return (
          <div className="no-autocomplete">
            <em>Not found</em>
          </div>
        );
      }
    }
    return <></>;
  };
  return (
    <>
      <input
        type="text"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Type Dealer Name"
        value={input}
      />
      {renderAutocomplete()}
    </>
  );
};
export default Autocomplete;
