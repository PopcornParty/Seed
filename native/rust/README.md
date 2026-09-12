# Rust port

Not implemented yet.

The C++ engine in `../cpp` is the native reference. A Rust port should
reproduce `mt_n_get` and `candidate_in_region` bit-for-bit and then share
the same gold vectors in `tests/parity`.
