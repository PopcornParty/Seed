#include "search.hpp"
#include <iostream>
#include <cstdlib>
#include <cstring>
int main(int argc, char** argv) {
    bedrock::SearchJob job; job.seed_count = 100000; job.top_n = 20; bool bench = false;
    for (int i = 1; i < argc; i++) {
        auto eq = [&](const char* s){ return std::strcmp(argv[i], s) == 0; };
        if (eq("--start") && i+1 < argc) job.seed_start = std::strtoll(argv[++i], nullptr, 10);
        else if (eq("--count") && i+1 < argc) job.seed_count = std::strtoll(argv[++i], nullptr, 10);
        else if (eq("--step") && i+1 < argc) job.seed_step = std::strtoll(argv[++i], nullptr, 10);
        else if (eq("--cx") && i+1 < argc) job.area.center_x = std::atoi(argv[++i]);
        else if (eq("--cz") && i+1 < argc) job.area.center_z = std::atoi(argv[++i]);
        else if (eq("--radius") && i+1 < argc) job.area.radius = std::atoi(argv[++i]);
        else if (eq("--top") && i+1 < argc) job.top_n = std::atoi(argv[++i]);
        else if (eq("--rank")) job.ranking = true;
        else if (eq("--bench")) bench = true;
        else if (eq("--need") && i+1 < argc) {
            std::string spec = argv[++i];
            bedrock::StructureCondition c;
            auto p1 = spec.find(':'); c.name = spec.substr(0, p1);
            auto rest = spec.substr(p1 + 1); auto p2 = rest.find(':');
            c.max_distance = std::atof(rest.substr(0, p2).c_str());
            if (p2 != std::string::npos) {
                auto rest2 = rest.substr(p2 + 1); auto p3 = rest2.find(':');
                c.min_count = std::atoi(rest2.substr(0, p3).c_str());
                if (p3 != std::string::npos) c.weight = std::atof(rest2.substr(p3 + 1).c_str());
            }
            job.conditions.push_back(c);
        }
    }
    if (job.conditions.empty()) job.conditions.push_back({"village", 1, 100000, bench ? 1500 : 500, 0, 20});
    auto out = bedrock::run_search(job);
    std::cout << "{\"tested\":" << out.stats.tested << ",\"matched\":" << out.stats.matched
              << ",\"rejected\":" << out.stats.rejected << ",\"seeds_per_sec\":" << out.stats.seeds_per_sec
              << ",\"elapsed_ms\":" << out.stats.elapsed_ms << ",\"engine_version\":\"" << out.stats.engine_version
              << "\",\"results\":[";
    for (size_t i = 0; i < out.results.size(); i++) {
        if (i) std::cout << ",";
        std::cout << "{\"seed\":" << out.results[i].seed << ",\"score\":" << out.results[i].score << "}";
    }
    std::cout << "]}\n";
    return 0;
}
