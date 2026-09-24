"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const categories = [
  { id: "all", label: "All" },
  { id: "coffee", label: "Coffee" },
  { id: "food", label: "Food" },
  { id: "pastry", label: "Pastry" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

const items = [
  {
    category: "coffee",
    name: "House Espresso",
    detail: "Chocolate, hazelnut, long finish",
    price: "£3.40",
  },
  {
    category: "coffee",
    name: "Oat Flat White",
    detail: "Silky, balanced, everyday favourite",
    price: "£3.80",
  },
  {
    category: "coffee",
    name: "Batch Brew",
    detail: "Rotating single origin",
    price: "£3.20",
  },
  {
    category: "coffee",
    name: "Seasonal Pour Over",
    detail: "Colombia this month",
    price: "£4.20",
  },
  {
    category: "coffee",
    name: "Cortado",
    detail: "Equal parts, short and sweet",
    price: "£3.50",
  },
  {
    category: "food",
    name: "Sourdough toast",
    detail: "Cultured butter, sea salt",
    price: "£4.00",
  },
  {
    category: "food",
    name: "Eggs on toast",
    detail: "Soft scramble, chives",
    price: "£7.50",
  },
  {
    category: "food",
    name: "Seasonal soup",
    detail: "Ask the bar for today",
    price: "£6.80",
  },
  {
    category: "food",
    name: "Ham and cheese toastie",
    detail: "Sourdough, pickles on the side",
    price: "£8.20",
  },
  {
    category: "pastry",
    name: "Almond croissant",
    detail: "Saturdays, and most weekdays",
    price: "£3.90",
  },
  {
    category: "pastry",
    name: "Cardamom bun",
    detail: "All week",
    price: "£3.60",
  },
  {
    category: "pastry",
    name: "Seasonal danish",
    detail: "Changes with the fruit",
    price: "£4.10",
  },
  {
    category: "pastry",
    name: "Chocolate cookie",
    detail: "Sea salt, still warm at 11",
    price: "£2.80",
  },
] as const;

const categoryMedia: Record<Exclude<CategoryId, "all">, { src: string; alt: string }> = {
  coffee: {
    src: "/brand/hearth-about.jpg",
    alt: "Portafilters with espresso, grounds, and beans",
  },
  food: {
    src: "/brand/hearth-food.jpg",
    alt: "Eggs on sourdough with an espresso on the table",
  },
  pastry: {
    src: "/brand/hearth-pastry.jpg",
    alt: "Almond croissant and cardamom bun on the counter",
  },
};

export function MenuBoard() {
  const [filter, setFilter] = useState<CategoryId>("all");

  const visible = useMemo(
    () =>
      filter === "all" ? items : items.filter((item) => item.category === filter),
    [filter],
  );

  const media = filter === "all" ? null : categoryMedia[filter];

  return (
    <div className="hc-menu-board">
      <div className="hc-filters" role="tablist" aria-label="Menu filters">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={filter === category.id}
            className={filter === category.id ? "is-active" : undefined}
            onClick={() => setFilter(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {media ? (
        <div className="hc-menu-media">
          <Image src={media.src} alt={media.alt} width={900} height={680} />
        </div>
      ) : null}

      <ul className="hc-menu">
        {visible.map((item) => (
          <li key={item.name}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.detail}</span>
            </div>
            <em>{item.price}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
