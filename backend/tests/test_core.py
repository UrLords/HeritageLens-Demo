import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import numpy as np
from backend.services import recognition_service as rec
from scripts import validate_dataset as vd


class T(unittest.TestCase):
    def test_accept(self):
        r = rec.decide({"a": .87, "b": .44, "c": .3}, .65, .05)
        self.assertTrue(r["recognized"]); self.assertEqual(r["object_id"], "a")

    def test_reject_low(self):
        self.assertFalse(rec.decide({"a": .42, "b": .39}, .65, .05)["recognized"])

    def test_reject_ambiguous(self):
        self.assertFalse(rec.decide({"a": .80, "b": .78}, .65, .05)["recognized"])

    def test_best_ref_per_object(self):
        refs = {"a": np.array([[1, 0], [0, 1.]]), "b": np.array([[0.6, 0.8]])}
        s = rec.score_objects(np.array([1., 0.]), refs)
        self.assertAlmostEqual(s["a"], 1.0); self.assertAlmostEqual(s["b"], 0.6)

    def test_validator_flags_todo(self):
        self.assertTrue(any("TODO" in e or "reference" in e for e in vd.validate()))


if __name__ == "__main__":
    unittest.main()
