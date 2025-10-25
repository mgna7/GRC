from __future__ import annotations

import statistics
from datetime import datetime, timezone
from typing import Dict, Iterable, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models import AnalysisResult, ControlData, RiskData, ServiceNowInstance
from app.schemas.analysis import (
    ComplianceAnalysisRequest,
    ComplianceAnalysisResponse,
    ComplianceGap,
    ControlAnalysisRequest,
    ControlAnalysisResponse,
    ControlEffectivenessScore,
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    RiskInsight,
)


class ControlEffectivenessAnalyzer:
    """Derive lightweight effectiveness scores from raw control metadata."""

    def evaluate(self, controls: Iterable[ControlData]) -> List[ControlEffectivenessScore]:
        scores: List[ControlEffectivenessScore] = []
        for control in controls:
            complexity = len(control.attributes.get("procedures", []))
            coverage = control.attributes.get("coverage", 0.5)
            maturity = control.attributes.get("maturity_level", 2)
            base_score = 0.4 * min(complexity / 5.0, 1.0)
            base_score += 0.4 * float(coverage)
            base_score += 0.2 * (maturity / 5.0)
            normalized = max(0.0, min(base_score, 1.0))
            commentary = "Robust control with balanced coverage."
            if normalized < 0.4:
                commentary = "Control effectiveness is limited; expand coverage and procedures."
            elif normalized < 0.7:
                commentary = "Moderate effectiveness; focus on maturity improvements."

            scores.append(
                ControlEffectivenessScore(
                    control_id=control.control_id,
                    effectiveness=round(normalized, 2),
                    commentary=commentary,
                )
            )
        return scores


class RiskCorrelationEngine:
    """Generate qualitative correlations between risks and controls."""

    def correlate(self, risks: Iterable[RiskData], controls: Iterable[ControlData]) -> List[RiskInsight]:
        control_by_category: Dict[str, List[str]] = {}
        for control in controls:
            for category in control.attributes.get("categories", []):
                control_by_category.setdefault(category.lower(), []).append(control.control_id)

        insights: List[RiskInsight] = []
        for risk in risks:
            categories = [risk.category.lower()] + [c.lower() for c in risk.attributes.get("tags", [])]
            correlated_controls = []
            for category in categories:
                correlated_controls.extend(control_by_category.get(category, []))
            correlated_controls = list(dict.fromkeys(correlated_controls))  # deduplicate preserving order
            likelihood = float(risk.attributes.get("likelihood", 0.5))
            impact = float(risk.attributes.get("impact", 0.5))
            narrative = "Risk alignment with available controls evaluated."
            if not correlated_controls:
                narrative = "No mapped controls detected; prioritize mitigation planning."
            insights.append(
                RiskInsight(
                    risk_id=risk.risk_id,
                    correlated_controls=correlated_controls,
                    likelihood=round(likelihood, 2),
                    impact=round(impact, 2),
                    narrative=narrative,
                )
            )
        return insights


class ComplianceGapAnalyzer:
    """Identify compliance gaps by comparing requirement evidence and status."""

    def assess(self, request: ComplianceAnalysisRequest) -> List[ComplianceGap]:
        gaps: List[ComplianceGap] = []
        for requirement in request.requirements:
            evidence_strength = float(requirement.evidence.get("strength", 0.4))
            status_factor = 1.0 if requirement.status in {"implemented", "compliant"} else 0.3
            narrative = "Requirement satisfied."
            gap_score = max(0.0, 1.0 - ((evidence_strength * 0.6) + (status_factor * 0.4)))
            if gap_score > 0.3:
                narrative = "Evidence insufficient or status incomplete; remediate promptly."
            gaps.append(
                ComplianceGap(
                    requirement_id=requirement.requirement_id,
                    gap_score=round(gap_score, 2),
                    recommendation=narrative,
                )
            )
        return gaps


class PredictiveAnalytics:
    """Placeholder predictive analytics leveraging stored analysis data."""

    def forecast_effectiveness(self, scores: List[ControlEffectivenessScore]) -> float:
        if not scores:
            return 0.0
        values = [score.effectiveness for score in scores]
        return round(statistics.mean(values), 2)


class NLPRegulatoryScan:
    """Placeholder NLP module for regulatory text scanning."""

    def extract_insights(self, _, __) -> Dict[str, float]:
        # Stub for integration with actual NLP pipelines.
        return {"policy_alignment": 0.75, "coverage": 0.68}


class AnalysisService:
    """Facade combining analyzers with persistence."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.control_analyzer = ControlEffectivenessAnalyzer()
        self.risk_engine = RiskCorrelationEngine()
        self.compliance_analyzer = ComplianceGapAnalyzer()
        self.predictive = PredictiveAnalytics()
        self.regulatory_scan = NLPRegulatoryScan()

    def _get_instance(self, instance_id: UUID) -> ServiceNowInstance:
        instance = self.db.get(ServiceNowInstance, instance_id)
        if not instance:
            raise AppError("ServiceNow instance not found.", status_code=404)
        return instance

    def analyze_controls(self, request: ControlAnalysisRequest) -> ControlAnalysisResponse:
        instance = self._get_instance(request.instance_id)
        now = datetime.now(tz=timezone.utc)

        controls = []
        for record in request.controls:
            control = ControlData(
                instance_id=instance.id,
                control_id=record.control_id,
                name=record.name,
                description=record.description,
                attributes=record.attributes,
                synced_at=now,
            )
            self.db.add(control)
            controls.append(control)
        self.db.flush()

        scores = self.control_analyzer.evaluate(controls)
        forecast = self.predictive.forecast_effectiveness(scores)
        summary = f"Average control effectiveness forecast: {forecast}"

        result = AnalysisResult(
            instance_id=instance.id,
            analysis_type="control",
            summary=summary,
            payload={"scores": [score.model_dump() for score in scores], "forecast": forecast},
            generated_at=now,
        )
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)

        return ControlAnalysisResponse(
            instance_id=instance.id,
            generated_at=result.generated_at,
            scores=scores,
            summary=summary,
        )

    def analyze_risks(self, request: RiskAnalysisRequest) -> RiskAnalysisResponse:
        instance = self._get_instance(request.instance_id)
        now = datetime.now(tz=timezone.utc)

        risks = []
        for record in request.risks:
            risk = RiskData(
                instance_id=instance.id,
                risk_id=record.risk_id,
                category=record.category,
                description=record.description,
                attributes=record.attributes,
                synced_at=now,
            )
            self.db.add(risk)
            risks.append(risk)
        self.db.flush()

        controls_stmt = select(ControlData).where(ControlData.instance_id == instance.id)
        controls = self.db.scalars(controls_stmt).all()
        insights = self.risk_engine.correlate(risks, controls)
        average_likelihood = round(statistics.mean(insight.likelihood for insight in insights), 2) if insights else 0.0
        summary = f"Mean likelihood across evaluated risks: {average_likelihood}"

        result = AnalysisResult(
            instance_id=instance.id,
            analysis_type="risk",
            summary=summary,
            payload={"insights": [insight.model_dump() for insight in insights]},
            generated_at=now,
        )
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)

        return RiskAnalysisResponse(
            instance_id=instance.id,
            generated_at=result.generated_at,
            insights=insights,
            summary=summary,
        )

    def analyze_compliance(self, request: ComplianceAnalysisRequest) -> ComplianceAnalysisResponse:
        instance = self._get_instance(request.instance_id)
        now = datetime.now(tz=timezone.utc)

        gaps = self.compliance_analyzer.assess(request)
        regulatory_scores = self.regulatory_scan.extract_insights(request.framework, request.requirements)
        avg_gap = round(statistics.mean(gap.gap_score for gap in gaps), 2) if gaps else 0.0
        summary = f"Average gap score for {request.framework}: {avg_gap}"

        result = AnalysisResult(
            instance_id=instance.id,
            analysis_type="compliance",
            summary=summary,
            payload={
                "gaps": [gap.model_dump() for gap in gaps],
                "regulatory_metrics": regulatory_scores,
            },
            generated_at=now,
        )
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)

        return ComplianceAnalysisResponse(
            instance_id=instance.id,
            framework=request.framework,
            generated_at=result.generated_at,
            gaps=gaps,
            summary=summary,
        )
