// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PropertyCard } from "@/components/properties/property-card";
import { PropertyGrid } from "@/components/properties/property-grid";
import type { Property } from "@/data/properties";

const address = "12 Example Street";

const entry: Property = {
  slug: "fixture-two-family",
  name: "Fixture two-family",
  area: "Toms River, NJ",
  address,
  type: "multi-family",
  status: "leased",
  photos: [],
  blurb: "Fixture.",
  acquired: 2023,
  order: 1,
};

describe("PropertyGrid", () => {
  it("renders the designed empty state when the inventory is empty", () => {
    const { container } = render(<PropertyGrid properties={[]} />);
    expect(screen.getByText("Portfolio details to follow")).toBeInTheDocument();
    expect(container.querySelectorAll("article")).toHaveLength(0);
  });

  it("renders one card per entry with h2 headings", () => {
    render(<PropertyGrid properties={[entry, { ...entry, slug: "second", name: "Second", order: 2 }]} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
    expect(screen.getByText("Fixture two-family")).toBeInTheDocument();
  });
});

describe("PropertyCard address policy", () => {
  it("never renders the address by default, even when the data has one", () => {
    const { container } = render(<PropertyCard property={entry} />);
    expect(screen.queryByText(address)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain(address);
  });

  it("renders the address only after showAddress is set", () => {
    render(<PropertyCard property={{ ...entry, showAddress: true }} />);
    expect(screen.getByText(address)).toBeInTheDocument();
  });

  it("shows the sketch and caption when there is no photo", () => {
    const { container } = render(<PropertyCard property={entry} />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText(/Multi-family/)).toBeInTheDocument();
    expect(screen.getByText("Leased")).toBeInTheDocument();
  });

  it("swaps the sketch for the lead photo with real sizes", () => {
    const { container } = render(
      <PropertyCard property={{ ...entry, photos: ["/properties/fixture-two-family/1.jpg"] }} />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("sizes")).toContain("33vw");
    expect(img?.getAttribute("alt")).toBe("Fixture two-family, Toms River, NJ");
    expect(container.querySelector("svg")).toBeNull();
  });
});
