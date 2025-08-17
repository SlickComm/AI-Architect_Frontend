// src/data/lv_tabs.js

export const lvTabs = [
  {
    title: "Straßenbauarbeiten",
    rows: [
      {
        T1: "1",
        T2: "01",
        Pos: "1000",
        description: "Asphaltdeckschicht AC 11 D, d = 4 cm, liefern und einbauen",
        price: 22.5,
        unit: "m²",
      },
      {
        T1: "1",
        T2: "01",
        Pos: "2000",
        description: "Gehwegplatten aufnehmen und wieder verlegen",
        price: 12.8,
        unit: "m²",
      },
      {
        T1: "1",
        T2: "01",
        Pos: "3000",
        description: "Fahrbahnmarkierung entfernen (Fräsen)",
        price: 9.9,
        unit: "m²",
      },
    ],
  },
  {
    title: "Erdarbeiten",
    rows: [
      {
        T1: "3",
        T2: "01",
        Pos: "1000",
        description: "Baugrube ausheben bis 1,50 m Tiefe",
        price: 11.4,
        unit: "m³",
      },
      {
        T1: "3",
        T2: "01",
        Pos: "2000",
        description: "Boden abfahren und entsorgen (unbelastet)",
        price: 16.2,
        unit: "m³",
      },
      {
        T1: "3",
        T2: "01",
        Pos: "3000",
        description: "Sandbett herstellen, 5 cm",
        price: 4.6,
        unit: "m²",
      },
    ],
  },
  {
    title: "Rohrleitungsarbeiten",
    rows: [
      {
        T1: "4",
        T2: "01",
        Pos: "1000",
        description: "PE-HD-Rohr DN 150 liefern und verlegen",
        price: 34.5,
        unit: "m",
      },
      {
        T1: "4",
        T2: "01",
        Pos: "2000",
        description: "Grabenverbau stellen und ziehen",
        price: 18.0,
        unit: "m",
      },
      {
        T1: "4",
        T2: "01",
        Pos: "3000",
        description: "Schacht DN 1000 setzen inkl. Abdeckung",
        price: 420.0,
        unit: "Stck",
      },
    ],
  },
];

export default lvTabs;