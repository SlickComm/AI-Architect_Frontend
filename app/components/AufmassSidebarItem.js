import React from "react";

export default function AufmassSidebarItem({ item, isActive, onClick }) {
  return (
    <li
      onClick={onClick}
      className={`aufmass-sidebar-item ${
        isActive ? "aufmass-sidebar-item--active" : ""
      }`}
    >
      <span className="aufmass-sidebar-item__title">{item.title}</span>
    </li>
  );
}
