# Source for code is Python Docs

import sys, os
import re

if len(sys.argv) < 2:
    sys.exit(f"Usage: {sys.argv[0]} needs a filename")

filename = sys.argv[1]

if not os.path.exists(filename):
    sys.exit(f"Error: File '{sys.argv[1]}' not found")

names_atbats = dict()
names_hits = dict()

with open(filename) as f:
    for line in f:
        if re.match(r"===", line) != None:
            continue
        elif re.match(r"#", line) != None:
            continue
        else:
            name = re.search(r"\w* \w*", line)
            if name == None:
                continue
            name = name.group()
            if name not in names_atbats.keys():
                names_atbats[name] = 0
            if name not in names_hits.keys():
                names_hits[name] = 0

            atbat_hit = [int(num) for num in re.findall(r"\d*", line) if num.isdigit()]
            
            if len(atbat_hit) >= 2:
                names_atbats[name] += int(atbat_hit[0])
                names_hits[name] += int(atbat_hit[1])

names_batavg = dict()

for name in names_atbats.keys():
    names_batavg[name] = names_hits[name] / names_atbats[name]

sorted_names_batavg = dict(sorted(names_batavg.items(), key = lambda item: item[1], reverse = True))

for name, batavg in sorted_names_batavg.items():
    rounded_num = round(batavg, 3)
    sorted_names_batavg[name] = f"{rounded_num:.3f}"

for name, batavg in sorted_names_batavg.items():
    print(f"{name}: {batavg}")