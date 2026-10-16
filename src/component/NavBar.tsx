import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "react-bootstrap/Badge";
import { useAppDispatch, useAppSelector } from "../hooks/hooks.ts";
import "../css/Cart.css";
import useDebounce from "../hooks/useDebounce.ts";
import { fetchProduct } from "../redux/features/productSlice.ts";

export default function NavBar() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { totalItem } = useAppSelector((state) => state.cartState);
  const searchQuery = useAppSelector((state) => state.productState.searchQuery);
  const wishlistCount = useAppSelector(
    (state) => state.wishlistState.items.length,
  );
  const user = useAppSelector((state) => state.authState.user);

  // Always holds the latest values so the effects below can read them
  // without re-running every time they change.
  const latest = useRef({ searchTerm, debouncedSearchTerm, searchQuery });
  useEffect(() => {
    latest.current = { searchTerm, debouncedSearchTerm, searchQuery };
  });

  // Typing -> search. Skips when the store already has this query
  // (e.g. on mount, or after a category pick cleared the input), so we
  // don't fire a redundant "fetch everything" request.
  // Category and sort are read from the store by the thunk itself.
  useEffect(() => {
    if (debouncedSearchTerm === latest.current.searchQuery) return;
    dispatch(fetchProduct({ skip: 0, searchQuery: debouncedSearchTerm }));
  }, [debouncedSearchTerm, dispatch]);

  // Picking a category resets the store's searchQuery to "".
  // Clear the input so it doesn't keep showing stale text.
  useEffect(() => {
    const { searchTerm, debouncedSearchTerm } = latest.current;
    if (
      searchQuery === "" &&
      searchTerm !== "" &&
      searchTerm === debouncedSearchTerm // not mid-typing
    ) {
      setSearchTerm("");
    }
  }, [searchQuery]);

  return (
    <header className="nav-bar">
      <nav>
        <div className="nav-content">
          <div className="nav-left">
            <Link to="/" className="nav-brand">
              Store
            </Link>
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/about" className="nav-link">
              About Us
            </Link>
          </div>

          <div className="nav-center">
            <div className="search-wrapper">
              <input
                type="text"
                value={searchTerm}
                placeholder="Search products..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="nav-right">
            <Link to="/wishlist" className="nav-link">
              <span>
                Wishlist{" "}
                {wishlistCount > 0 && (
                  <Badge bg="secondary">{wishlistCount}</Badge>
                )}
              </span>
            </Link>
            <Link to="/cart" className="nav-link">
              <span>
                Cart <Badge bg="danger">{totalItem}</Badge>
              </span>
            </Link>
            {user ? (
              <Link to="/profile" className="nav-link nav-btn">
                {user.firstName}
              </Link>
            ) : (
              <Link to="/login" className="nav-link nav-btn">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
