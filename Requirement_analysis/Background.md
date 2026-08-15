Summary:
1. Primary Request and Intent:
The user (Hiep Thach) is in Week 8 of the CKBuilder 12-week CKB developer program. The primary task is to analyze 30 CKB-Native Project Ideas from `30 CKB-Native Project Ideas.docx`, understand each idea, and pick one for the capstone project (Weeks 9-12). The user wants a detailed written analysis in a `.md` file under `walkthrough/week8/`. The user is particularly interested in Idea 11 (DOB Credential & Badge Protocol) and needs a message to send to Neon (the reviewer/program director) to confirm the project direction before starting.

2. Key Technical Concepts:
- **Nervos CKB / Cell Model**: cells as state, capacity, Lock/Type scripts, WitnessArgs
- **Spore Protocol / DOB**: Clusters, DNA, melt-to-reclaim, Spore Cells (already used in Week 4 and Week 6 projects)
- **CCC SDK**: `@ckb-ccc/connector-react`, `@ckb-ccc/ccc`, wallet integration (JoyID, MetaMask, Omnilock)
- **Rust on-chain scripts**: hash-lock contract (Week 5), Molecule serialization (Week 7), CKB-VM optimization
- **ckb-testtool / ckb-debugger**: for testing and debugging Rust contracts
- **xUDT / sUDT**: fungible token standards (Week 3, Week 6)
- **OffCKB**: local devnet for testing
- **ckb-indexer**: for querying on-chain cells
- **Molecule**: serialization format for CKB on-chain data
- **Capstone project scope**: 4 weeks (Week 9-12), ~4-5 hours/week commitment

3. Files and Code Sections:
- `/home/hiepthach/04_CKB/30 CKB-Native Project Ideas.docx` — source document containing 30 project ideas across 9 categories (Developer Tooling, On-Chain Storage, Spore/DOB, RGB++, AI Agents, OTX, Fiber, Identity, Social). Read via python-docx.
- `/home/hiepthach/04_CKB/CKBuilder_12_Week_Plan.md` — the 12-week plan showing Week 8 = architecture design, Weeks 9-12 = capstone execution.
- `/home/hiepthach/04_CKB/.agents/skills/ckb-dev/SKILL.md` — CKB development skill reference file with default stack decisions (Rust first for on-chain scripts, CCC SDK first for DApps, ckb-testtool for testing).
- `/home/hiepthach/04_CKB/CKBuilder/week1-7/` — weekly reports (W1-W7) documenting skills learned:
  - W1: Setup, CKB transfer, Module 1
  - W2: Cell Model, Store Data on Cell, Academy Module 2
  - W3: NFTs, Scripts, Fungible Token (xUDT), Modules 3 & 6
  - W4: DOB creation, CKB node setup, CCC workshop, tiny-dob project
  - W5: Lock scripts (hash-lock Rust), CCC Playground, Module 4
  - W6: L1 course completion, xudt-token-manager, spore-badge-platform, mini-tip-jar
  - W7: CKB-VM deep dive, Molecule practice, CKB-VM optimization (-44.5% binary size, -65% cycles)