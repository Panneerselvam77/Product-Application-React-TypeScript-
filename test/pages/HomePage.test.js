import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Home from "../../src/pages/HomePage";

const {
  addItemMock,
  dispatchMock,
  fetchProductMock,
  productState,
  resetFiltersMock,
  setCategoryMock,
  setSortMock,
  toastErrorMock,
} = vi.hoisted(() => ({
  addItemMock: vi.fn(),
  dispatchMock: vi.fn(),
  fetchProductMock: vi.fn((payload) => ({ type: "fetchProduct", payload })),
  productState: {},
  resetFiltersMock: vi.fn(() => ({ type: "resetFilters" })),
  setCategoryMock: vi.fn((payload) => ({ type: "setCategory", payload })),
  setSortMock: vi.fn((payload) => ({ type: "setSort", payload })),
  toastErrorMock: vi.fn(),
}));

vi.mock("../../src/hooks/hooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector) => selector({ productState }),
}));

vi.mock("../../src/hooks/useCartActions", () => ({
  default: () => ({ addItem: addItemMock }),
}));

vi.mock("../../src/redux/features/productSlice", () => ({
  fetchProduct: fetchProductMock,
  resetFilters: resetFiltersMock,
  setCategory: setCategoryMock,
  setSort: setSortMock,
}));

vi.mock("react-toastify", () => ({
  toast: { error: toastErrorMock },
}));

vi.mock("../../src/component/FilterSidebar", () => ({
  toSortValue: () => "",
  default: ({ onSelectCategory, onSortChange, onClear }) =>
    createElement(
      "aside",
      null,
      createElement(
        "button",
        { onClick: () => onSelectCategory("beauty") },
        "Select category",
      ),
      createElement(
        "button",
        { onClick: () => onSortChange({ sortBy: "price", order: "asc" }) },
        "Sort by price",
      ),
      createElement("button", { onClick: onClear }, "Clear filters"),
    ),
}));

vi.mock("../../src/component/ProductCard", () => ({
  default: ({ product, onAddToCart }) =>
    createElement(
      "button",
      { onClick: () => onAddToCart(product) },
      `Add ${product.title}`,
    ),
}));

vi.mock("../../src/component/SpinningLoader", () => ({
  default: () => createElement("div", null, "Loading products"),
}));

const product = { id: 1, title: "Test product" };

function setState(overrides = {}) {
  Object.assign(
    productState,
    {
      products: [],
      isError: null,
      isLoading: false,
      hasMore: true,
      skip: 0,
      searchQuery: "",
      selectedCategory: "",
      sortBy: "",
      order: "asc",
    },
    overrides,
  );
}

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setState();
  });

  it("renders the page heading and fetches products on initial load", () => {
    render(createElement(Home));

    expect(fetchProductMock).toHaveBeenCalledWith({
      skip: 0,
      searchQuery: "",
    });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "fetchProduct",
      payload: { skip: 0, searchQuery: "" },
    });
  });

  it("shows the initial loading indicator", () => {
    setState({ isLoading: true });

    render(createElement(Home));

    expect(screen.getByText("Loading products")).toBeInTheDocument();
  });

  it("shows an empty state with the selected category", () => {
    setState({ selectedCategory: "beauty" });

    render(createElement(Home));

    expect(
      screen.getByText("No products found in Beauty."),
    ).toBeInTheDocument();
  });

  it("shows fetch errors inline and as a toast", () => {
    setState({ isError: "Unable to load products" });

    render(createElement(Home));

    expect(
      screen.getByText("Error: Unable to load products"),
    ).toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith("Unable to load products", {
      toastId: "products-error",
    });
  });

  it("loads another page when Load More is clicked", () => {
    setState({ products: [product], skip: 10, searchQuery: "phone" });

    render(createElement(Home));
    fireEvent.click(screen.getByRole("button", { name: "Load More" }));

    expect(fetchProductMock).toHaveBeenCalledWith({
      skip: 10,
      searchQuery: "phone",
    });
  });

  it("disables Load More while products are loading", () => {
    setState({ products: [product], isLoading: true });

    render(createElement(Home));

    expect(screen.getByRole("button", { name: "Loading..." })).toBeDisabled();
  });

  it("dispatches actions when filters change or are cleared", () => {
    render(createElement(Home));
    dispatchMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Select category" }));
    expect(setCategoryMock).toHaveBeenCalledWith("beauty");
    expect(dispatchMock).toHaveBeenNthCalledWith(1, {
      type: "setCategory",
      payload: "beauty",
    });
    expect(dispatchMock).toHaveBeenNthCalledWith(2, {
      type: "fetchProduct",
      payload: { skip: 0, searchQuery: "" },
    });

    dispatchMock.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Sort by price" }));
    expect(setSortMock).toHaveBeenCalledWith({ sortBy: "price", order: "asc" });
    expect(dispatchMock).toHaveBeenNthCalledWith(1, {
      type: "setSort",
      payload: { sortBy: "price", order: "asc" },
    });
    expect(dispatchMock).toHaveBeenNthCalledWith(2, {
      type: "fetchProduct",
      payload: { skip: 0, searchQuery: "" },
    });

    dispatchMock.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(resetFiltersMock).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: "resetFilters" });
  });

  it("adds a product to the cart", () => {
    setState({ products: [product] });

    render(createElement(Home));
    fireEvent.click(screen.getByRole("button", { name: "Add Test product" }));

    expect(addItemMock).toHaveBeenCalledWith(product);
  });
});
