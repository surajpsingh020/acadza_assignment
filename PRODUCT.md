# Product Memo: The Acadza "Report → Fix" Autonomous Loop

**To:** Acadza Leadership & Academic Operations  
**From:** Full-Stack AI Engineer & EdTech Architect  
**Subject:** Autonomous Quality Engine & Faculty Review Console for 8 Lakh Questions  

---

### 1. Stakeholder Impact: Who Loses Most When a Question is Broken?

In high-stakes exams like JEE Advanced and NEET-UG, **a single broken question can alter an aspirant's life trajectory**:
- **The Student (Highest Stakes):** A broken question costs 5 marks (+4 lost for correct attempt + 1 negative mark penalty). In JEE, a 5-mark swing shifts rank by **1,200 to 3,500 positions**, turning an IIT Computer Science admission into an NIT or non-allotment. Mentally, a student who spends 8 minutes trying to solve an unsound question spirals into anxiety mid-mock test.
- **The Faculty (Operational Burnout):** Faculty spend **25-35 hours each week** manually reading duplicate, unstructured complaints (*"ans galat hai"*), manually re-solving basic physics equations, and typing manual responses rather than mentoring students.
- **Our Solution:** Clusters duplicate reports, resolves student calculation mistakes in seconds with kind, mathematically accurate replies, and automatically repairs high-confidence defects while presenting faculty with one-click decision diffs.

---

### 2. The Safety Boundary: What AI Must Never Auto-Apply

Autonomous AI execution must stop where **academic subjectivity, content authoring, and institutional liability begin**. We enforce hard stops on:
1. **Unsound Questions (`unsound`):** When both Assertion and Reason are false, or no options match reality. The AI must never invent exam corrections without faculty sign-off.
2. **Identical Options & Distractor Crafting (`identical_options`):** Creating believable distractors is pedagogical art. A flawed replacement option corrupts question psychometrics (item discrimination index).
3. **Missing Diagrams (`diagram`):** Spatial representations in kinematics, ray optics, or anatomy cannot be hallucinated without ground truth schematics.
4. **Syllabus Disputes (`syllabus`):** NMC/NTA syllabus revisions require institutional policy alignment, not statistical language prediction.
5. **Adversarial Injections (`prompt_injection`):** Any student report containing system prompt overrides (`IGNORE ALL PREVIOUS INSTRUCTIONS`) is hard-blocked with zero database write permissions.

---

### 3. Week-1 North Star Metric: *Zero False Positive Auto-Applies (0.0% FPAR)*

While Mean Time to Resolution (MTTR) is an important velocity metric, in EdTech **reputation is asymmetric**: 100 fast correct fixes are erased by 1 incorrect auto-applied answer key.

$$\text{North Star Metric} = \text{False Positive Auto-Apply Rate (FPAR)} = \frac{\text{Auto-applied fixes revoked by faculty or students}}{\text{Total auto-applied fixes}} \le 0.05\%$$

**Secondary Operational Guardrail:**
- **MTTR Reduction:** Reduce median report resolution time from **72 hours to under 45 seconds** for auto-fixes and under **12 minutes** for faculty review cases.

---

### 4. Beyond the Brief: Pre-Ingestion "Shift-Left" Defect Scanner

Today, defects are caught reactively when an innocent student stumbles upon them in an active mock test. We pitch **Acadza Shield (Shift-Left Autonomous Auditing)**:
- **Pre-Ingestion CI/CD for Questions:** Before any question enters the 8-lakh question bank, an autonomous agentic worker pool runs independent multi-solver verification, checks for duplicate options, validates image assets, and verifies MathML rendering across viewport breakpoints.
- **Unreported Defect Mining (Assignment Bonus):** As demonstrated in our console's *"Unreported Scanner"*, our solver identified 4 defective questions that students had not yet reported (`<mspace>` tag leakage outside MathML, optical power solution blunders `eqcu`/`eqch`, and notation case mismatches `4DF` vs `4Df`). Proactive scanning eliminates defects before they hurt a single student.
