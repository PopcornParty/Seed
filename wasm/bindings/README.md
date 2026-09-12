# WASM bindings

Not implemented yet.

There is no Emscripten toolchain pinned in CI. Browser search uses the
TypeScript engine inside a Web Worker so local hunts work without WASM.

When WASM lands, CI must run the same gold vectors through C++ and WASM
and fail on any mismatch.
