export interface Category {
  slug: string;
  name: string;
}

export const CATEGORIES: Category[] = [
  { slug: "reactors", name: "Reactors" },
  { slug: "heat-transfer-equipment", name: "Heat Transfer Equipment" },
  { slug: "separation-equipment", name: "Separation Equipment" },
  { slug: "fluid-handling-equipment", name: "Fluid Handling Equipment" },
  { slug: "size-reduction-equipment", name: "Size Reduction Equipment" },
  { slug: "mixing-equipment", name: "Mixing Equipment" },
];
