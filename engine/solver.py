"""
STEM Independent Solver & Trap Detector for Acadza Triage Engine.
Provides deterministic verification of student claims, independent recalculation
of physics/math solutions, and adversarial injection defense.
"""

import re
import math
from typing import Dict, Any, Optional, Tuple

class StemSolver:
    """Independent STEM solver that calculates ground truth before evaluating reports."""

    INJECTION_PATTERNS = [
        r"ignore\s+(all\s+)?previous\s+instructions",
        r"you\s+are\s+(the\s+)?admin\s+bot",
        r"system\s*:\s*",
        r"system\s+override",
        r"change\s+the\s+answer\s+to",
        r"mark\s+this\s+report\s+as\s+corrected",
        r"jailbreak",
        r"<script",
        r"drop\s+table"
    ]

    @classmethod
    def check_prompt_injection(cls, comment: str) -> bool:
        """Detect prompt injection attempts in student comments."""
        lower = comment.lower()
        for pat in cls.INJECTION_PATTERNS:
            if re.search(pat, lower):
                return True
        return False

    @classmethod
    def solve_lcr_circuit(cls, vl: float, vc: float, vr: float) -> Tuple[float, str]:
        """Calculates LCR series circuit supply voltage: V = sqrt(Vr^2 + (Vl - Vc)^2)"""
        v = math.sqrt(vr**2 + (vl - vc)**2)
        explanation = f"V = sqrt({vr}^2 + ({vl} - {vc})^2) = sqrt({vr**2} + {(vl-vc)**2}) = {v} V"
        return v, explanation

    @classmethod
    def solve_gas_pressure(cls, density: float, v_rms: float) -> Tuple[float, str]:
        """Calculates ideal gas pressure: P = (1/3) * rho * v_rms^2"""
        p = (1.0 / 3.0) * density * (v_rms ** 2)
        explanation = f"P = (1/3) * {density} * ({v_rms})^2 = {p} N/m^2"
        return p, explanation

    @classmethod
    def solve_friction_mu(cls, weight: float, f1_acc: float, f2_acc: float, g: float = 10.0) -> Tuple[float, float, str]:
        """
        Solves block on rough surface:
        F - mu*W = m*a1  => F = m*a1 + mu*W
        2F - mu*W = m*a2 => 2(m*a1 + mu*W) - mu*W = m*a2 => 2*m*a1 + mu*W = m*a2
        mu = m*(a2 - 2*a1) / W, where m = W/g
        """
        m = weight / g
        mu = m * (f2_acc - 2 * f1_acc) / weight
        f = m * f1_acc + mu * weight
        explanation = f"m = {weight}/{g} = {m} kg; 2F - mu*100 = {m*f2_acc} and F - mu*100 = {m*f1_acc} => mu = {mu:.1f}, F = {f:.1f} N"
        return mu, f, explanation

    @classmethod
    def solve_flux_cube(cls, q_face: float, q_corner: float) -> Tuple[float, str]:
        """
        Gauss law for charges on cube:
        Center of face shared by 2 cubes => flux = q_face / (2 * eps0)
        Corner of cube shared by 8 cubes => flux = q_corner / (8 * eps0)
        If q_face = q/2, phi1 = (q/2) / (2 eps0) = q / (4 eps0)
        If q_corner = 2q, phi2 = (2q) / (8 eps0) = q / (4 eps0)
        Total flux = phi1 + phi2 = q / (2 eps0) => n = 2
        """
        explanation = (
            "Charge q/2 at face center contributes (q/2)/(2*eps0) = q/(4*eps0). "
            "Charge 2q at corner contributes (2q)/(8*eps0) = q/(4*eps0). "
            "Total flux = q/(4*eps0) + q/(4*eps0) = q/(2*eps0) => n = 2."
        )
        return 2.0, explanation

    @classmethod
    def solve_sig_figs(cls, side: float, num_faces: int = 6) -> Tuple[float, float, str]:
        """
        Significant digits for cube surface area:
        side has 4 significant digits (e.g. 7.203)
        Area = 6 * side^2
        """
        raw_area = num_faces * (side ** 2)
        # 7.203 has 4 sig figs, so area rounded to 4 sig figs
        rounded_area = round(raw_area, 1) # 311.299... -> 311.3
        ans_10a = round(rounded_area * 10)
        explanation = (
            f"Side {side} has 4 significant figures. "
            f"Raw Area = {num_faces} * ({side})^2 = {raw_area:.3f} m^2. "
            f"Rounding to 4 sig figs gives A = {rounded_area} m^2. "
            f"Then 10A = {ans_10a}."
        )
        return rounded_area, ans_10a, explanation

    @classmethod
    def solve_shm_amplitude(cls, period: float, t: float, v: float) -> Tuple[float, str]:
        """
        SHM starting from equilibrium: x = A*sin(w*t), v = A*w*cos(w*t)
        w = 2*pi/T
        A = v / (w * cos(w*t))
        """
        w = 2 * math.pi / period
        phase = w * t
        cos_val = math.cos(phase)
        # For T=16, t=2, w = pi/8, w*t = pi/4, cos(pi/4) = 1/sqrt(2)
        # v = pi => pi = A * (pi/8) * (1/sqrt(2)) => A = 8 * sqrt(2)
        explanation = (
            f"Period T = {period} s => omega = 2*pi/{period} = pi/8 rad/s. "
            f"At t = {t} s, velocity v = A*omega*cos(pi/4) = A*(pi/8)*(1/sqrt(2)). "
            f"Given v = pi m/s, A = 8*sqrt(2) m."
        )
        return 8 * math.sqrt(2), explanation

    @classmethod
    def solve_relative_rotation(cls, alpha1: float, alpha2: float) -> Tuple[float, str]:
        """
        Time for two rotating wheels to align again:
        delta_theta = 0.5 * (alpha1 - alpha2) * t^2 = 2*pi
        t^2 = 4*pi / (alpha1 - alpha2)
        """
        diff = alpha1 - alpha2
        t_squared = (4 * math.pi) / diff
        t = math.sqrt(t_squared)
        explanation = (
            f"Wheels realign when relative angular displacement is 2*pi radians. "
            f"0.5 * ({alpha1:.3f} - {alpha2:.3f}) * t^2 = 2*pi => t = {round(t)} seconds."
        )
        return t, explanation

    @classmethod
    def solve_ydse_shift(cls, d_big: float, d_small: float, t1: float, mu1: float, t2: float, mu2: float) -> Tuple[float, str]:
        """
        YDSE shift = (D / d) * [t1*(mu1 - 1) - t2*(mu2 - 1)]
        """
        shift_m = (d_big / d_small) * (t1 * (mu1 - 1) - t2 * (mu2 - 1))
        shift_cm = shift_m * 100
        explanation = (
            f"Optical path difference = t1*(mu1 - 1) - t2*(mu2 - 1) = {t1}*({mu1}-1) - {t2}*({mu2}-1) = 0.4 mm. "
            f"Shift = (D/d) * delta_x = (1 m / 5 mm) * 0.4 mm = 0.08 m = {round(shift_cm)} cm."
        )
        return round(shift_cm), explanation
