#pragma once
#include <cstdint>
namespace bedrock {
inline uint32_t mt_init_step(uint32_t prev, uint32_t offset) {
    return 0x6c078965u * (prev ^ (prev >> 30u)) + offset;
}
inline void mt_n_get(uint32_t seed, int n, uint32_t* result) {
    uint32_t head[8];
    uint32_t last[8];
    if (n < 1 || n > 6) return;
    head[0] = seed;
    for (int i = 1; i < n + 1; i++) head[i] = mt_init_step(head[i - 1], static_cast<uint32_t>(i));
    uint32_t temp = head[n];
    for (int i = n; i < 397; i++) temp = mt_init_step(temp, static_cast<uint32_t>(i + 1));
    last[0] = temp;
    for (int i = 1; i < n + 1; ++i) last[i] = mt_init_step(last[i - 1], static_cast<uint32_t>(i + 397));
    for (int i = 0; i < n; i++) {
        temp = (head[i] & 0x80000000u) + (head[i + 1] & 0x7fffffffu);
        head[i] = (temp >> 1u) ^ last[i];
        if (temp % 2 != 0) head[i] ^= 0x9908b0dfu;
    }
    for (int i = 0; i < n; ++i) {
        uint32_t y = head[i];
        y ^= y >> 11u;
        y ^= (y << 7u) & 2636928640u;
        y ^= (y << 15u) & 4022730752u;
        y ^= y >> 18u;
        result[i] = y;
    }
}
inline float int_2_float(uint32_t x) { return static_cast<float>(x) * 2.328306436538696e-10f; }
inline uint32_t structure_seed(int64_t world_seed) {
    return static_cast<uint32_t>(static_cast<uint64_t>(world_seed) & 0xffffffffull);
}
}
