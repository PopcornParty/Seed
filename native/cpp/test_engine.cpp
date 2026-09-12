#include "structures.hpp"
#include "search.hpp"
#include <cassert>
#include <iostream>
int main() {
    using namespace bedrock;
    uint32_t a[4], b[4]; mt_n_get(12345u, 4, a); mt_n_get(12345u, 4, b);
    assert(a[0]==b[0] && a[1]==b[1]);
    assert(structure_seed(1)==1u);
    assert(structure_seed((int64_t)4294967296ll + 7)==7u);
    const StructureConfig* village = find_config("village"); assert(village);
    ChunkPos v1 = candidate_in_region(1, *village, 0, 0);
    assert(v1.x==7 && v1.z==10);
    ChunkPos v2 = candidate_in_region(1, *village, 2, -1);
    assert(v2.x==64 && v2.z==-13);
    uint32_t mt[4]; mt_n_get(1, 4, mt);
    assert(mt[0]==1791095845u);
    SearchJob job; job.seed_start=0; job.seed_count=200; job.area={0,0,800};
    job.conditions.push_back({"village",1,100,800,0,10}); job.top_n=5;
    auto out = run_search(job);
    assert(out.stats.tested==200);
    assert(out.stats.matched + out.stats.rejected == 200);
    SearchJob bad; bad.seed_count=10; bad.conditions.push_back({"ancient_city",1,1,2000,0,10});
    assert(run_search(bad).stats.matched==0);
    std::cout << "CPP_TESTS_OK sps=" << out.stats.seeds_per_sec << "\n";
    return 0;
}
