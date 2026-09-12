#pragma once
#include "structures.hpp"
#include <functional>
#include <chrono>
#include <algorithm>
namespace bedrock {
struct SearchArea { int32_t center_x = 0; int32_t center_z = 0; int32_t radius = 2000; };
struct StructureCondition { std::string name; int min_count = 1; int max_count = 100000; double max_distance = 2000; double min_distance = 0; double weight = 10; };
struct SearchJob { int64_t seed_start = 0; int64_t seed_count = 10000; int64_t seed_step = 1; SearchArea area; std::vector<StructureCondition> conditions; bool ranking = false; int top_n = 50; std::string bedrock_version = "1.21"; std::string engine_version = "0.1.0"; };
struct FoundStructure { std::string name; int32_t x = 0; int32_t z = 0; double distance = 0; Accuracy accuracy = Accuracy::Validated; };
struct SeedResult { int64_t seed = 0; double score = 0; std::vector<FoundStructure> structures; };
struct StageStats { uint64_t initial = 0; uint64_t structure_pass = 0; uint64_t biome_pass = 0; uint64_t terrain_pass = 0; uint64_t final_matches = 0; };
struct SearchStats { uint64_t tested = 0; uint64_t rejected = 0; uint64_t matched = 0; double seeds_per_sec = 0; double elapsed_ms = 0; StageStats stages; std::string bedrock_version; std::string engine_version; };
struct SearchOutput { SearchStats stats; std::vector<SeedResult> results; std::vector<std::string> notes; };
inline std::vector<FoundStructure> collect_candidates(uint32_t low32, const StructureConfig& cfg, const SearchArea& area) {
    std::vector<FoundStructure> found; if (!cfg.implemented) return found;
    BlockPos center{area.center_x, area.center_z};
    if (cfg.id == StructureId::Stronghold) {
        for (auto& p : stronghold_candidates(low32)) {
            double d = block_dist(p, center);
            if (d <= (double)area.radius + 1.0) found.push_back({cfg.name, p.x, p.z, d, cfg.candidate_accuracy});
        }
        return found;
    }
    int32_t min_x = area.center_x - area.radius, max_x = area.center_x + area.radius;
    int32_t min_z = area.center_z - area.radius, max_z = area.center_z + area.radius;
    int32_t rx0 = floor_div(floor_div(min_x, 16), cfg.spacing) - 1;
    int32_t rx1 = floor_div(floor_div(max_x, 16), cfg.spacing) + 1;
    int32_t rz0 = floor_div(floor_div(min_z, 16), cfg.spacing) - 1;
    int32_t rz1 = floor_div(floor_div(max_z, 16), cfg.spacing) + 1;
    for (int32_t rx = rx0; rx <= rx1; ++rx) for (int32_t rz = rz0; rz <= rz1; ++rz) {
        BlockPos bp = chunk_to_block_center(candidate_in_region(low32, cfg, rx, rz));
        double d = block_dist(bp, center);
        if (d <= (double)area.radius) found.push_back({cfg.name, bp.x, bp.z, d, cfg.candidate_accuracy});
    }
    return found;
}
inline bool evaluate_seed(int64_t seed, const SearchJob& job, SeedResult& out) {
    uint32_t low = structure_seed(seed); out.seed = seed; out.score = 0; out.structures.clear();
    for (const auto& cond : job.conditions) {
        const StructureConfig* cfg = find_config(cond.name);
        if (!cfg || !cfg->implemented) return false;
        auto cands = collect_candidates(low, *cfg, job.area);
        std::vector<FoundStructure> ok;
        for (auto& f : cands) if (f.distance >= cond.min_distance && f.distance <= cond.max_distance) ok.push_back(f);
        int count = (int)ok.size();
        if (count < cond.min_count || count > cond.max_count) return false;
        double nearest = ok.empty() ? cond.max_distance : ok[0].distance;
        for (auto& f : ok) nearest = std::min(nearest, f.distance);
        double closeness = 1.0 - (nearest / std::max(cond.max_distance, 1.0));
        if (closeness < 0) closeness = 0;
        out.score += cond.weight * (0.5 + 0.5 * closeness);
        std::sort(ok.begin(), ok.end(), [](auto& a, auto& b){ return a.distance < b.distance; });
        int keep = std::min(count, 8);
        out.structures.insert(out.structures.end(), ok.begin(), ok.begin() + keep);
    }
    return true;
}
inline SearchOutput run_search(const SearchJob& job, const std::function<bool(const SearchStats&)>& on_progress = nullptr) {
    SearchOutput output;
    output.stats.bedrock_version = job.bedrock_version;
    output.stats.engine_version = job.engine_version;
    output.notes.push_back("Structure positions are CANDIDATES from Bedrock region/salt/MT RNG.");
    output.notes.push_back("Biome validation is NOT implemented.");
    auto t0 = std::chrono::steady_clock::now();
    output.stats.stages.initial = (uint64_t)std::max<int64_t>(job.seed_count, 0);
    std::vector<SeedResult> ranked;
    for (int64_t i = 0; i < job.seed_count; ++i) {
        int64_t seed = job.seed_start + i * job.seed_step;
        output.stats.tested++;
        SeedResult res;
        if (evaluate_seed(seed, job, res)) {
            output.stats.matched++; output.stats.stages.structure_pass++; output.stats.stages.final_matches++;
            if (job.ranking) {
                ranked.push_back(std::move(res));
                std::sort(ranked.begin(), ranked.end(), [](auto& a, auto& b){ return a.score > b.score; });
                if ((int)ranked.size() > job.top_n) ranked.pop_back();
            } else if ((int)output.results.size() < job.top_n) output.results.push_back(std::move(res));
        } else output.stats.rejected++;
        if (on_progress && (i & 4095) == 0) {
            auto now = std::chrono::steady_clock::now();
            output.stats.elapsed_ms = std::chrono::duration<double, std::milli>(now - t0).count();
            output.stats.seeds_per_sec = output.stats.elapsed_ms > 0 ? (output.stats.tested * 1000.0 / output.stats.elapsed_ms) : 0;
            if (!on_progress(output.stats)) break;
        }
    }
    auto t1 = std::chrono::steady_clock::now();
    output.stats.elapsed_ms = std::chrono::duration<double, std::milli>(t1 - t0).count();
    output.stats.seeds_per_sec = output.stats.elapsed_ms > 0 ? (output.stats.tested * 1000.0 / output.stats.elapsed_ms) : 0;
    if (job.ranking) output.results = std::move(ranked);
    return output;
}
}
