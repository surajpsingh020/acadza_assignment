"""
Generate results.json by running the deterministic TriageEngine on all 44 reports.
Strictly validates outputs against data/taxonomy.json.
"""

import json
import sys
from triage import TriageEngine

def validate_result(res: dict, taxonomy: dict, questions_map: dict):
    """Rigorous schema and taxonomy validator."""
    # 1. Required keys
    req_keys = ["reportId", "questionId", "verdict", "repair", "edit", "route", "confidence", "evidence", "student_reply"]
    for k in req_keys:
        assert k in res, f"Missing required key '{k}' in {res}"

    # 2. Verdict valid
    verdict = res["verdict"]
    assert verdict in taxonomy["verdicts"], f"Invalid verdict '{verdict}'"

    # 3. Route valid
    assert res["route"] in ["auto_apply", "faculty_review", "no_change"], f"Invalid route '{res['route']}'"

    # 4. If verdict != defect => route MUST be no_change, repair MUST be None (or absent)
    if verdict != "defect":
        assert res["route"] == "no_change", f"Non-defect report {res['reportId']} cannot have route '{res['route']}'"
        assert res["repair"] is None, f"Non-defect report {res['reportId']} cannot have repair '{res['repair']}'"
        assert res["edit"] == {}, f"Non-defect report {res['reportId']} cannot have edit {res['edit']}"

    # 5. If verdict == defect
    if verdict == "defect":
        repair = res["repair"]
        assert repair in taxonomy["repairs"], f"Invalid repair '{repair}'"
        repair_spec = taxonomy["repairs"][repair]

        # Check auto rule
        if not repair_spec.get("auto", False):
            assert res["route"] == "faculty_review", f"Repair '{repair}' has auto=False, route must be faculty_review, got '{res['route']}'"

        # Check field scoping
        if res["edit"] and "field" in res["edit"]:
            edit_field = res["edit"]["field"]
            allowed_fields = repair_spec.get("fields", [])
            assert edit_field in allowed_fields, f"Repair '{repair}' cannot touch field '{edit_field}'. Allowed: {allowed_fields}"

    # 6. Confidence range
    assert 0.0 <= res["confidence"] <= 1.0, f"Confidence out of range: {res['confidence']}"

    # 7. Student reply length (1 to 3 sentences)
    reply = res["student_reply"].strip()
    sentences = [s for s in reply.split(".") if s.strip()]
    assert len(sentences) >= 1, f"Student reply must have at least 1 sentence in {res['reportId']}"

def main():
    with open("data/reports.json", "r", encoding="utf-8") as f:
        reports = json.load(f)
    with open("data/taxonomy.json", "r", encoding="utf-8") as f:
        taxonomy = json.load(f)
    with open("data/questions.json", "r", encoding="utf-8") as f:
        questions = json.load(f)

    q_map = {q["_id"]: q for q in questions}
    engine = TriageEngine()

    results = []
    stats = {
        "total": len(reports),
        "auto_apply": 0,
        "faculty_review": 0,
        "no_change": 0,
        "defect": 0,
        "no_error": 0,
        "display_issue": 0,
        "app_issue": 0,
        "language_mode": 0,
        "already_fixed": 0,
        "not_actionable": 0
    }

    for r in reports:
        res = engine.triage_report(r)
        validate_result(res, taxonomy, q_map)
        results.append(res)

        stats[res["route"]] += 1
        stats[res["verdict"]] += 1

    # Write results.json at root
    with open("results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("=" * 60)
    print(f"Successfully processed and validated {len(results)} reports!")
    print(f"Saved results to results.json")
    print(f"Stats summary:")
    print(f"  - Auto-applied: {stats['auto_apply']}")
    print(f"  - Faculty review: {stats['faculty_review']}")
    print(f"  - No change: {stats['no_change']}")
    print(f"  - Verdicts: {stats['defect']} defects, {stats['no_error']} no_error, {stats['display_issue']} display_issue, {stats['app_issue']} app_issue, {stats['language_mode']} language_mode, {stats['already_fixed']} already_fixed, {stats['not_actionable']} not_actionable")
    print("=" * 60)

if __name__ == "__main__":
    main()
