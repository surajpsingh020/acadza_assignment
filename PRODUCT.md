# Product Memo: The Acadza "Report → Fix" Autonomous Loop

**To:** Acadza Leadership & Academic Operations  
**From:** Full-Stack AI Engineer & EdTech Architect  
**Subject:** Autonomous Quality Engine & Faculty Review Console for 8 Lakh Questions  

---

### 1. Stakeholder Impact: Who Loses Most When a Question is Broken?

In competitive examinations like JEE Advanced and NEET-UG, **a single defective question alters an aspirant's life trajectory**:
- **The Aspirant (Highest Stakes):** A broken question costs 5 raw marks (+4 forfeited for a correct derivation + 1 negative marking penalty). In JEE, a 5-mark swing shifts rank by **1,200 to 3,500 positions**, turning an IIT Computer Science admission into an NIT or non-allotment. Beyond ranks, an aspirant spending 8 futile minutes re-checking an unsound question experiences cognitive depletion and panic mid-mock test.
- **The Faculty (Operational Burnout):** Faculty spend **25–35 hours weekly** reading raw, duplicate complaints (*"ans galat hai"*, *"sir 50 kyu nahi"*), manually re-solving textbook problems, and typing repetitive explanations rather than high-leverage teaching.
- **Our Design Response:** Group duplicate reports to eliminate repetitive faculty labor, resolve student calculation mistakes instantly with empathetic step-by-step guidance, and auto-fix verified clerical errors so question flaws never propagate to another student.

---

### 2. The Safety Boundary: What AI Must Never Auto-Apply

Autonomous AI execution must halt where **pedagogical subjectivity, content authoring, and institutional liability begin**. We enforce hard stops on:
1. **Unsound Questions (`unsound`):** When both Assertion and Reason are false, or options lack a mathematically valid choice. The AI must never invent exam modifications without human academic sign-off.
2. **Duplicate Options & Distractor Crafting (`identical_options`):** Authoring believable distractors requires domain psychometrics. An invalid distractor alters item discrimination index ($D$-index).
3. **Missing Diagrams (`diagram`):** Spatial geometry in ray optics, mechanics, or anatomy cannot be hallucinated without ground truth schematics.
4. **Syllabus Disputes (`syllabus`):** NTA/NMC syllabus changes require institutional policy decisions, not statistical language prediction.
5. **Adversarial Injections (`prompt_injection`):** Student reports attempting roleplay or override directives (`IGNORE ALL PREVIOUS INSTRUCTIONS`) are hard-blocked with zero database write permissions.

---

### 3. Week-1 North Star Metric: *Zero False Positive Auto-Applies (0.0% FPAR)*

In EdTech, **institutional credibility is asymmetric**: 100 fast, accurate auto-fixes are erased by a single incorrect auto-applied answer key.

$$\text{North Star Metric} = \text{False Positive Auto-Apply Rate (FPAR)} = \frac{\text{Auto-applied fixes revoked by faculty or students}}{\text{Total auto-applied fixes}} \le 0.05\%$$

**Secondary Operational Guardrail:**
- **MTTR Reduction:** Reduce median report resolution time from **72 hours to under 45 seconds** for auto-fixes, and under **12 minutes** for faculty review cases.

---

### 4. Beyond the Brief: Pre-Ingestion "Shift-Left" Defect Scanner

Defects are currently discovered reactively after an innocent student stumbles upon them in an active mock test. We pitch **Acadza Shield (Shift-Left Autonomous Auditing)**:
- **Pre-Ingestion CI/CD Pipeline:** Before any question enters the 8-lakh question bank, an autonomous agentic worker pool runs independent STEM solver verification, checks for duplicate options, validates image assets, and verifies MathML layout across mobile breakpoints.
- **Unreported Defect Mining (Assignment Bonus):** As demonstrated in our console's *"Unreported Scanner"*, our solver proactively caught 4 defective questions that students had never reported (`<mspace>` tag leakage outside MathML, optical power solution blunders `eqcu`/`eqch`, and notation case mismatches `4DF` vs `4Df`). Proactive scanning eliminates defects before they hurt a single student.
