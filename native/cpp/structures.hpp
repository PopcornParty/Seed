#pragma once
#include "bedrock_rng.hpp"
#include <cstdint>
#include <string>
#include <vector>
#include <cmath>
namespace bedrock {
enum class Accuracy { Exact, Validated, Approximate, Unsupported };
inline const char* accuracy_name(Accuracy a) {
    switch (a) {
        case Accuracy::Exact: return "EXACT";
        case Accuracy::Validated: return "VALIDATED";
        case Accuracy::Approximate: return "APPROXIMATE";
        case Accuracy::Unsupported: return "UNSUPPORTED";
    }
    return "UNKNOWN";
}
enum class StructureId { Village, DesertPyramid, JungleTemple, SwampHut, Igloo, OceanMonument, WoodlandMansion, PillagerOutpost, BuriedTreasure, Shipwreck, OceanRuin, RuinedPortalOverworld, RuinedPortalNether, NetherComplex, EndCity, Stronghold, AncientCity, TrailRuins, TrialChambers };
struct StructureConfig {
    StructureId id; const char* name; int spacing; int spawn_range; int salt; int num;
    Accuracy candidate_accuracy; Accuracy biome_accuracy; bool implemented;
};
inline const StructureConfig kConfigs[] = {
    {StructureId::Village, "village", 27, 17, 10387312, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::DesertPyramid, "desert_pyramid", 32, 24, 14357617, 2, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::JungleTemple, "jungle_temple", 32, 24, 14357617, 2, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::SwampHut, "swamp_hut", 32, 24, 14357617, 2, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::Igloo, "igloo", 32, 24, 14357617, 2, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::OceanMonument, "ocean_monument", 32, 27, 10387313, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::WoodlandMansion, "woodland_mansion", 80, 60, 10387319, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::PillagerOutpost, "pillager_outpost", 80, 56, 165745296, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::BuriedTreasure, "buried_treasure", 4, 2, 16842397, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::Shipwreck, "shipwreck", 10, 5, 1, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::OceanRuin, "ocean_ruin", 12, 5, 14357621, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::RuinedPortalOverworld, "ruined_portal", 40, 25, 40552231, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::RuinedPortalNether, "ruined_portal_nether", 25, 15, 40552231, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::NetherComplex, "nether_complex", 30, 26, 430084232, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::EndCity, "end_city", 20, 9, 10387313, 4, Accuracy::Validated, Accuracy::Unsupported, true},
    {StructureId::Stronghold, "stronghold", 0, 0, 0, 0, Accuracy::Approximate, Accuracy::Unsupported, true},
    {StructureId::AncientCity, "ancient_city", 0, 0, 0, 0, Accuracy::Unsupported, Accuracy::Unsupported, false},
    {StructureId::TrailRuins, "trail_ruins", 0, 0, 0, 0, Accuracy::Unsupported, Accuracy::Unsupported, false},
    {StructureId::TrialChambers, "trial_chambers", 0, 0, 0, 0, Accuracy::Unsupported, Accuracy::Unsupported, false}
};
inline const StructureConfig* find_config(const std::string& name) {
    for (const auto& c : kConfigs) if (name == c.name) return &c;
    return nullptr;
}
inline int32_t floor_div(int32_t a, int32_t b) {
    int32_t q = a / b, r = a % b;
    if (r != 0 && ((a < 0) != (b < 0))) q -= 1;
    return q;
}
inline uint32_t candidate_area_seed(int32_t rx, int32_t rz, int salt) {
    return static_cast<uint32_t>(salt) - static_cast<uint32_t>(245998635u * static_cast<uint32_t>(rz)) - static_cast<uint32_t>(1724254968u * static_cast<uint32_t>(rx));
}
inline int32_t get_cong_with_module(int32_t start, int32_t mod, int32_t target) {
    int32_t r = start % mod; if (r < 0) r += mod;
    int32_t d = target - r; if (d < 0) d += mod;
    return start + d;
}
struct ChunkPos { int32_t x; int32_t z; };
struct BlockPos { int32_t x; int32_t z; };
inline ChunkPos candidate_in_region(uint32_t world_low32, const StructureConfig& cfg, int32_t rx, int32_t rz) {
    uint32_t area = candidate_area_seed(rx, rz, cfg.salt) + world_low32;
    uint32_t mt[4]; mt_n_get(area, cfg.num, mt);
    uint32_t avg_x, avg_z;
    if (cfg.num == 2) { avg_x = mt[0] % (uint32_t)cfg.spawn_range; avg_z = mt[1] % (uint32_t)cfg.spawn_range; }
    else {
        uint32_t r1 = mt[0] % (uint32_t)cfg.spawn_range, r2 = mt[1] % (uint32_t)cfg.spawn_range;
        uint32_t r3 = mt[2] % (uint32_t)cfg.spawn_range, r4 = mt[3] % (uint32_t)cfg.spawn_range;
        avg_x = (r1 + r2) / 2; avg_z = (r3 + r4) / 2;
    }
    return { get_cong_with_module(rx * cfg.spacing, cfg.spacing, (int32_t)avg_x), get_cong_with_module(rz * cfg.spacing, cfg.spacing, (int32_t)avg_z) };
}
inline BlockPos chunk_to_block_center(ChunkPos c) { return {c.x * 16 + 8, c.z * 16 + 8}; }
inline double block_dist(BlockPos a, BlockPos b) {
    double dx = (double)a.x - (double)b.x, dz = (double)a.z - (double)b.z;
    return std::sqrt(dx * dx + dz * dz);
}
inline std::vector<BlockPos> stronghold_candidates(uint32_t seed_low32) {
    uint32_t mt[2]; mt_n_get(seed_low32, 2, mt);
    double angle = 6.2831855 * (double)int_2_float(mt[0]);
    uint32_t chunk_dist = mt[1] % 16 + 40;
    std::vector<BlockPos> out;
    for (int count = 0; count < 3; ++count) {
        int cx = (int)std::floor(std::cos(angle) * (double)chunk_dist);
        int cz = (int)std::floor(std::sin(angle) * (double)chunk_dist);
        out.push_back({cx * 16, cz * 16});
        angle += 1.8849558; chunk_dist += 8;
    }
    return out;
}
}
